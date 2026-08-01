import { describe, expect, it } from 'vitest';
import { SimulationClock } from '../../src/core/clock';

describe('simulation clock', () => {
  it('uses callback timestamps, clamps long frames, and never catches up after resume', () => {
    const clock = new SimulationClock();

    expect(clock.tick(100)).toBe(0);
    expect(clock.tick(116)).toBe(16);
    expect(clock.tick(1000)).toBe(50);
    expect(clock.elapsedMs).toBe(66);

    clock.pause('hidden');
    expect(clock.tick(2000)).toBe(0);
    expect(clock.elapsedMs).toBe(66);
    clock.resume('hidden');
    expect(clock.tick(5000)).toBe(0);
    expect(clock.tick(5016)).toBe(16);
    expect(clock.elapsedMs).toBe(82);
  });

  it('keeps independent manual and hidden pause reasons from resuming each other', () => {
    const clock = new SimulationClock();
    clock.tick(0);
    clock.pause('manual');
    clock.pause('hidden');
    expect(clock.reasons).toEqual(['hidden', 'manual']);

    clock.resume('hidden');
    expect(clock.isPaused).toBe(true);
    expect(clock.reasons).toEqual(['manual']);
    expect(clock.tick(100)).toBe(0);

    clock.resume('manual');
    expect(clock.isPaused).toBe(false);
    expect(clock.tick(200)).toBe(0);
  });

  it('resets elapsed time and pause state for a new run', () => {
    const clock = new SimulationClock();
    clock.tick(0);
    clock.tick(25);
    clock.pause('manual');
    clock.reset();

    expect(clock.elapsedMs).toBe(0);
    expect(clock.reasons).toEqual([]);
    expect(clock.tick(500)).toBe(0);
  });
});
