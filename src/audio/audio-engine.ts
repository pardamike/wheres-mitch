import { AUDIO_CUES, type AudioCue, type NoiseCue, type ToneCue } from './cues';

export interface AudioParamLike {
  setValueAtTime(value: number, startTime: number): unknown;
  linearRampToValueAtTime(value: number, endTime: number): unknown;
  exponentialRampToValueAtTime(value: number, endTime: number): unknown;
}

export interface AudioNodeLike {
  connect(destination: AudioNodeLike): unknown;
  disconnect?(): unknown;
}

export interface GainNodeLike extends AudioNodeLike {
  gain: AudioParamLike;
}

export interface OscillatorNodeLike extends AudioNodeLike {
  frequency: AudioParamLike;
  type: OscillatorType;
  start(when?: number): unknown;
  stop(when?: number): unknown;
}

export interface AudioBufferLike {
  getChannelData(channel: number): Float32Array;
}

export interface AudioBufferSourceNodeLike extends AudioNodeLike {
  buffer: AudioBufferLike | null;
  start(when?: number): unknown;
  stop(when?: number): unknown;
}

export interface AudioContextLike {
  currentTime: number;
  state: string;
  destination: AudioNodeLike;
  createGain(): GainNodeLike;
  createOscillator(): OscillatorNodeLike;
  createBuffer?(channels: number, length: number, sampleRate: number): AudioBufferLike;
  createBufferSource?(): AudioBufferSourceNodeLike;
  sampleRate?: number;
  resume(): Promise<unknown>;
  suspend(): Promise<unknown>;
  close(): Promise<unknown>;
}

export type AudioContextFactory = () => AudioContextLike | null;

export interface AudioEngineOptions {
  contextFactory?: AudioContextFactory;
}

export interface AudioEngineDebugState {
  available: boolean;
  unlocked: boolean;
  muted: boolean;
  suspended: boolean;
  cueCount: number;
}

function browserAudioContext(): AudioContextLike | null {
  const candidate =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!candidate) {
    return null;
  }
  return new candidate() as unknown as AudioContextLike;
}

/**
 * A deliberately small Web Audio wrapper. It never creates a context at import/load time and all
 * browser failures are swallowed so audio cannot affect game rules or outcome completion.
 */
export class AudioEngine {
  private readonly contextFactory: AudioContextFactory;
  private context: AudioContextLike | null = null;
  private master: GainNodeLike | null = null;
  private unlocked = false;
  private muted = false;
  private unavailable = false;
  private cueCount = 0;

  constructor(options: AudioEngineOptions = {}) {
    this.contextFactory = options.contextFactory ?? browserAudioContext;
  }

  get debugState(): Readonly<AudioEngineDebugState> {
    return Object.freeze({
      available: !this.unavailable,
      unlocked: this.unlocked,
      muted: this.muted,
      suspended: this.context?.state === 'suspended',
      cueCount: this.cueCount,
    });
  }

  async unlock(): Promise<boolean> {
    if (this.unavailable) {
      return false;
    }
    try {
      if (!this.context) {
        const context = this.contextFactory();
        if (!context) {
          this.unavailable = true;
          return false;
        }
        const master = context.createGain();
        master.connect(context.destination);
        this.context = context;
        this.master = master;
      }
      if (this.context.state !== 'running') {
        await this.context.resume();
      }
      this.unlocked = true;
      this.applyMasterGain();
      return true;
    } catch {
      this.unavailable = true;
      this.context = null;
      this.master = null;
      return false;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyMasterGain();
  }

  cue(cue: AudioCue): boolean {
    const context = this.context;
    const master = this.master;
    if (!this.unlocked || this.unavailable || this.muted || !context || !master) {
      return false;
    }
    if (context.state !== 'running') {
      return false;
    }
    try {
      for (const tone of AUDIO_CUES[cue].tones) {
        this.playTone(context, master, tone);
      }
      for (const noise of AUDIO_CUES[cue].noise ?? []) {
        this.playNoise(context, master, noise);
      }
      this.cueCount += 1;
      return true;
    } catch {
      return false;
    }
  }

  async suspend(): Promise<void> {
    if (!this.unlocked || !this.context || this.context.state === 'suspended') {
      return;
    }
    try {
      await this.context.suspend();
    } catch {
      // Browsers may reject a late lifecycle request. Visual play continues normally.
    }
  }

  async resume(): Promise<void> {
    if (!this.unlocked || !this.context || this.context.state === 'running') {
      return;
    }
    try {
      await this.context.resume();
      this.applyMasterGain();
    } catch {
      // Do not retry automatically; a later deliberate player gesture can unlock again.
    }
  }

  async dispose(): Promise<void> {
    const context = this.context;
    this.context = null;
    this.master = null;
    this.unlocked = false;
    if (!context) {
      return;
    }
    try {
      await context.close();
    } catch {
      // Closing an already closed browser context is harmless.
    }
  }

  private applyMasterGain(): void {
    if (!this.context || !this.master) {
      return;
    }
    try {
      this.master.gain.setValueAtTime(this.muted ? 0 : 0.14, this.context.currentTime);
    } catch {
      // A failed gain update should never alter visual state.
    }
  }

  private playTone(context: AudioContextLike, master: GainNodeLike, tone: ToneCue): void {
    const start = context.currentTime + (tone.offsetMs ?? 0) / 1000;
    const end = start + tone.durationMs / 1000;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = tone.type ?? 'sine';
    oscillator.frequency.setValueAtTime(tone.frequency, start);
    if (tone.endFrequency !== undefined) {
      oscillator.frequency.linearRampToValueAtTime(tone.endFrequency, end);
    }
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(tone.gain, start + Math.min(0.025, tone.durationMs / 3000));
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  }

  private playNoise(context: AudioContextLike, master: GainNodeLike, noise: NoiseCue): void {
    if (!context.createBuffer || !context.createBufferSource) {
      return;
    }
    const sampleRate = context.sampleRate ?? 44_100;
    const start = context.currentTime + (noise.offsetMs ?? 0) / 1000;
    const end = start + noise.durationMs / 1000;
    const buffer = context.createBuffer(
      1,
      Math.max(1, Math.ceil(sampleRate * (noise.durationMs / 1000))),
      sampleRate,
    );
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = Math.random() * 2 - 1;
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(noise.gain, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    source.connect(gain);
    gain.connect(master);
    source.start(start);
    source.stop(end + 0.02);
  }
}
