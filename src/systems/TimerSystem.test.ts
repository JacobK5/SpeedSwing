import { describe, it, expect } from 'vitest';
import { TimerSystem } from './TimerSystem';

describe('TimerSystem', () => {
  it('reads zero and not-running before it starts', () => {
    const t = new TimerSystem();
    expect(t.started).toBe(false);
    expect(t.running).toBe(false);
    expect(t.elapsed(1000)).toBe(0);
  });

  it('measures live elapsed time while running', () => {
    const t = new TimerSystem();
    t.start(1000);
    expect(t.running).toBe(true);
    expect(t.elapsed(1500)).toBe(500);
    expect(t.elapsed(3000)).toBe(2000);
  });

  it('ignores repeated start calls (first-input start is idempotent)', () => {
    const t = new TimerSystem();
    t.start(1000);
    t.start(2000); // should not move the start
    expect(t.elapsed(3000)).toBe(2000);
  });

  it('freezes elapsed time once stopped', () => {
    const t = new TimerSystem();
    t.start(1000);
    t.stop(4000);
    expect(t.finished).toBe(true);
    expect(t.running).toBe(false);
    expect(t.elapsed(9000)).toBe(3000); // frozen at stop, ignores later now
  });

  it('does not stop a timer that never started', () => {
    const t = new TimerSystem();
    t.stop(5000);
    expect(t.finished).toBe(false);
    expect(t.elapsed(6000)).toBe(0);
  });
});
