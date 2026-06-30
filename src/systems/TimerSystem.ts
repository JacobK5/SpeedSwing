// Speedrun timer.
//
// Deliberately Phaser-free: every method takes the current time (ms) from the
// caller, so the timing logic is deterministic and unit testable. The scene
// decides *when* to start (first player input) and stop (goal reached), which
// keeps the timer from ever interrupting flow (docs/03-core-mechanics.md).

export class TimerSystem {
  private startTime: number | null = null;
  private stopTime: number | null = null;

  /** Timer has started and not yet stopped. */
  get running(): boolean {
    return this.startTime !== null && this.stopTime === null;
  }

  /** Timer has been started (whether or not it is still running). */
  get started(): boolean {
    return this.startTime !== null;
  }

  /** Timer has been stopped at a final time. */
  get finished(): boolean {
    return this.stopTime !== null;
  }

  /** Start the clock. No-op if already started (so first-input start is safe). */
  start(now: number): void {
    if (this.startTime === null) {
      this.startTime = now;
    }
  }

  /** Stop the clock at `now`. No-op if not running. */
  stop(now: number): void {
    if (this.startTime !== null && this.stopTime === null) {
      this.stopTime = now;
    }
  }

  /** Elapsed milliseconds: live while running, frozen once stopped, 0 before start. */
  elapsed(now: number): number {
    if (this.startTime === null) {
      return 0;
    }
    const end = this.stopTime ?? now;
    return Math.max(0, end - this.startTime);
  }
}
