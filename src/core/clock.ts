export type ClockPauseReason = 'manual' | 'hidden' | 'visibility-countdown';

export class SimulationClock {
  private readonly pauseReasons = new Set<ClockPauseReason>();
  private previousTimestamp: number | null = null;
  private elapsed = 0;
  lastFrameDeltaMs = 0;

  get elapsedMs(): number {
    return this.elapsed;
  }

  get isPaused(): boolean {
    return this.pauseReasons.size > 0;
  }

  get reasons(): readonly ClockPauseReason[] {
    return Array.from(this.pauseReasons).sort();
  }

  tick(timestamp: number): number {
    if (this.previousTimestamp === null) {
      this.previousTimestamp = timestamp;
      this.lastFrameDeltaMs = 0;
      return 0;
    }
    this.lastFrameDeltaMs = Math.max(0, Math.min(50, timestamp - this.previousTimestamp));
    this.previousTimestamp = timestamp;
    if (this.isPaused) {
      return 0;
    }
    this.elapsed += this.lastFrameDeltaMs;
    return this.lastFrameDeltaMs;
  }

  pause(reason: ClockPauseReason): void {
    this.pauseReasons.add(reason);
  }

  resume(reason: ClockPauseReason): void {
    this.pauseReasons.delete(reason);
    this.previousTimestamp = null;
    this.lastFrameDeltaMs = 0;
  }

  reset(): void {
    this.pauseReasons.clear();
    this.previousTimestamp = null;
    this.elapsed = 0;
    this.lastFrameDeltaMs = 0;
  }
}
