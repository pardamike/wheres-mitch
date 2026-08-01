export interface SequenceBeat<Context> {
  id: string;
  durationMs: number;
  reducedDurationMs?: number;
  enter?(context: Context): void;
  update?(context: Context, progress: number): void;
  exit?(context: Context): void;
}

export interface SequenceSnapshot {
  token: number;
  active: boolean;
  completed: boolean;
  cancelled: boolean;
  skipped: boolean;
  beatId: string | null;
  beatIndex: number;
  beatElapsedMs: number;
  beatDurationMs: number;
  elapsedMs: number;
  totalDurationMs: number;
}

function durationFor<Context>(beat: SequenceBeat<Context>, reducedMotion: boolean): number {
  const duration = reducedMotion ? (beat.reducedDurationMs ?? beat.durationMs) : beat.durationMs;
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Sequence beat ${beat.id} needs a finite positive duration.`);
  }
  return duration;
}

function snapshotFor(
  token: number,
  beats: readonly SequenceBeat<unknown>[],
  beatIndex: number,
  beatElapsedMs: number,
  reducedMotion: boolean,
  active: boolean,
  completed: boolean,
  cancelled: boolean,
  skipped: boolean,
  elapsedMs: number,
): SequenceSnapshot {
  const beat = beats[beatIndex];
  const beatDurationMs = beat ? durationFor(beat, reducedMotion) : 0;
  return Object.freeze({
    token,
    active,
    completed,
    cancelled,
    skipped,
    beatId: beat?.id ?? null,
    beatIndex,
    beatElapsedMs,
    beatDurationMs,
    elapsedMs,
    totalDurationMs: beats.reduce(
      (total, candidate) => total + durationFor(candidate, reducedMotion),
      0,
    ),
  });
}

export class SequenceRunner<Context> {
  private readonly beats: readonly SequenceBeat<Context>[];
  private readonly ids = new Set<string>();
  private active = false;
  private completed = false;
  private cancelled = false;
  private skipped = false;
  private token = 0;
  private beatIndex = 0;
  private beatElapsedMs = 0;
  private elapsedMs = 0;
  private reducedMotion = false;

  constructor(beats: readonly SequenceBeat<Context>[]) {
    if (beats.length === 0) {
      throw new Error('A sequence needs at least one beat.');
    }
    for (const beat of beats) {
      if (!beat.id || this.ids.has(beat.id)) {
        throw new Error(`Sequence beat IDs must be unique: ${beat.id || '(empty)'}`);
      }
      this.ids.add(beat.id);
      durationFor(beat, false);
      durationFor(beat, true);
    }
    this.beats = beats;
  }

  get snapshot(): SequenceSnapshot {
    return snapshotFor(
      this.token,
      this.beats as readonly SequenceBeat<unknown>[],
      this.beatIndex,
      this.beatElapsedMs,
      this.reducedMotion,
      this.active,
      this.completed,
      this.cancelled,
      this.skipped,
      this.elapsedMs,
    );
  }

  start(token: number, context: Context, reducedMotion = false): SequenceSnapshot {
    this.active = true;
    this.completed = false;
    this.cancelled = false;
    this.skipped = false;
    this.token = token;
    this.beatIndex = 0;
    this.beatElapsedMs = 0;
    this.elapsedMs = 0;
    this.reducedMotion = reducedMotion;
    this.enterCurrent(context);
    this.updateCurrent(context, 0);
    return this.snapshot;
  }

  advance(deltaMs: number, context: Context): SequenceSnapshot {
    if (!this.active || !Number.isFinite(deltaMs) || deltaMs <= 0) {
      return this.snapshot;
    }
    let remaining = deltaMs;
    while (remaining > 0 && this.active) {
      const duration = this.currentDuration();
      const toBoundary = duration - this.beatElapsedMs;
      const consumed = Math.min(remaining, toBoundary);
      this.beatElapsedMs += consumed;
      this.elapsedMs += consumed;
      remaining -= consumed;
      this.updateCurrent(context, this.beatElapsedMs / duration);
      if (this.beatElapsedMs + Number.EPSILON >= duration) {
        this.exitCurrent(context);
        this.beatIndex += 1;
        this.beatElapsedMs = 0;
        if (this.beatIndex >= this.beats.length) {
          this.active = false;
          this.completed = true;
          break;
        }
        this.enterCurrent(context);
        this.updateCurrent(context, 0);
      }
    }
    return this.snapshot;
  }

  skip(context: Context): SequenceSnapshot {
    if (!this.active) {
      return this.snapshot;
    }
    this.skipped = true;
    while (this.active) {
      this.updateCurrent(context, 1);
      this.exitCurrent(context);
      this.elapsedMs += this.currentDuration() - this.beatElapsedMs;
      this.beatIndex += 1;
      this.beatElapsedMs = 0;
      if (this.beatIndex >= this.beats.length) {
        this.active = false;
        this.completed = true;
        break;
      }
      this.enterCurrent(context);
      this.updateCurrent(context, 0);
    }
    return this.snapshot;
  }

  cancel(token: number): SequenceSnapshot {
    if (this.active && token === this.token) {
      this.active = false;
      this.cancelled = true;
    }
    return this.snapshot;
  }

  private currentBeat(): SequenceBeat<Context> {
    const beat = this.beats[this.beatIndex];
    if (!beat) {
      throw new Error('Sequence has no active beat.');
    }
    return beat;
  }

  private currentDuration(): number {
    return durationFor(this.currentBeat(), this.reducedMotion);
  }

  private enterCurrent(context: Context): void {
    this.currentBeat().enter?.(context);
  }

  private updateCurrent(context: Context, progress: number): void {
    this.currentBeat().update?.(context, Math.max(0, Math.min(1, progress)));
  }

  private exitCurrent(context: Context): void {
    this.currentBeat().exit?.(context);
  }
}
