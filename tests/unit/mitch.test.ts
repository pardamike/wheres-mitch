import { describe, expect, it } from 'vitest';
import { difficultyForRound } from '../../src/core/difficulty';
import { getWashingtonDefinition } from '../../src/scenes/washington';
import { createMitch, mitchSnapshot, updateMitch } from '../../src/world/mitch';

function runTrace(seed: number, completedRounds = 0, frames = 1800): string[] {
  const definition = getWashingtonDefinition();
  const mitch = createMitch(definition, seed, difficultyForRound(completedRounds));
  for (let frame = 0; frame < frames; frame += 1) {
    updateMitch(mitch, definition, 50);
  }
  return mitch.trace;
}

describe('Turtle Mitch routing and fairness', () => {
  it('reproduces the same route trace for a seed and varies across seeds', () => {
    expect(runTrace(324001)).toEqual(runTrace(324001));
    expect(runTrace(324001)).not.toEqual(runTrace(324002));
  });

  it('avoids immediate spot repeats while an authored alternative exists', () => {
    const destinations = runTrace(324001)
      .filter((entry) => entry.startsWith('transit:'))
      .map((entry) => entry.slice(entry.lastIndexOf('->') + 2));

    expect(destinations.length).toBeGreaterThan(3);
    for (let index = 1; index < destinations.length; index += 1) {
      expect(destinations[index]).not.toBe(destinations[index - 1]);
    }
  });

  it('moves continuously along routes without a position jump and never exceeds hidden bounds', () => {
    const definition = getWashingtonDefinition();
    const profile = difficultyForRound(0);
    const mitch = createMitch(definition, 324001, profile);
    let maximumHiddenElapsed = 0;

    for (let frame = 0; frame < 2000; frame += 1) {
      const before = { ...mitch.position };
      updateMitch(mitch, definition, 25);
      const moved = Math.hypot(mitch.position.x - before.x, mitch.position.y - before.y);
      expect(moved).toBeLessThanOrEqual((profile.mitchSpeed * 25) / 1000 + 0.000001);
      maximumHiddenElapsed = Math.max(maximumHiddenElapsed, mitch.fullyHiddenElapsedMs);
    }

    expect(maximumHiddenElapsed).toBeLessThanOrEqual(profile.maxHiddenMs);
  });

  it('keeps the opening readable and leaves zero-delta pause frames unchanged', () => {
    const definition = getWashingtonDefinition();
    const profile = difficultyForRound(0);
    const mitch = createMitch(definition, 324001, profile);

    updateMitch(mitch, definition, 2399);
    expect(mitch.mode).toBe('peek');
    expect(mitch.clickable).toBe(true);
    const before = mitchSnapshot(mitch);
    updateMitch(mitch, definition, 0);
    expect(mitchSnapshot(mitch)).toEqual(before);

    updateMitch(mitch, definition, 1);
    expect(mitch.mode).toBe('deciding');
    expect(mitch.clickable).toBe(true);
  });
});
