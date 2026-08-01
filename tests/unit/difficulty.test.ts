import { describe, expect, it } from 'vitest';
import { difficultyForRound } from '../../src/core/difficulty';

describe('canonical difficulty profile', () => {
  it('matches every round-one baseline constant', () => {
    expect(difficultyForRound(0)).toEqual({
      crowdCount: 48,
      crowdSpeed: 1,
      mitchSpeed: 70,
      routeDecisionMs: 3200,
      dwellMs: 2100,
      peekMs: 1200,
      maxHiddenMs: 2400,
      hitboxScale: 1.15,
    });
  });

  it('clamps invalid inputs to the safe round-one profile', () => {
    expect(difficultyForRound(-1)).toEqual(difficultyForRound(0));
    expect(difficultyForRound(Number.NaN)).toEqual(difficultyForRound(0));
    expect(difficultyForRound(Number.POSITIVE_INFINITY)).toEqual(difficultyForRound(0));
  });

  it('remains finite and monotonic through round 100', () => {
    let previous = difficultyForRound(0);
    for (let index = 1; index <= 100; index += 1) {
      const next = difficultyForRound(index);
      for (const value of Object.values(next)) {
        expect(Number.isFinite(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
      }
      expect(next.crowdCount).toBeGreaterThanOrEqual(previous.crowdCount);
      expect(next.crowdSpeed).toBeGreaterThanOrEqual(previous.crowdSpeed);
      expect(next.mitchSpeed).toBeGreaterThanOrEqual(previous.mitchSpeed);
      expect(next.routeDecisionMs).toBeLessThanOrEqual(previous.routeDecisionMs);
      expect(next.dwellMs).toBeLessThanOrEqual(previous.dwellMs);
      expect(next.peekMs).toBeLessThanOrEqual(previous.peekMs);
      expect(next.maxHiddenMs).toBeLessThanOrEqual(previous.maxHiddenMs);
      expect(next.hitboxScale).toBeLessThanOrEqual(previous.hitboxScale);
      previous = next;
    }
  });

  it('hits the documented absurd late-game thresholds without exceeding ceilings', () => {
    const roundTwentyFive = difficultyForRound(24);
    const extreme = difficultyForRound(1000);

    expect(roundTwentyFive.crowdCount).toBe(96);
    expect(roundTwentyFive.mitchSpeed).toBeGreaterThan(1000);
    expect(roundTwentyFive.routeDecisionMs).toBeLessThan(120);
    expect(roundTwentyFive.peekMs).toBeLessThan(100);
    expect(roundTwentyFive.hitboxScale).toBe(0.72);
    expect(extreme.crowdCount).toBe(96);
    expect(extreme.crowdSpeed).toBe(1.65);
    expect(extreme.mitchSpeed).toBe(2000);
    expect(extreme.routeDecisionMs).toBe(70);
    expect(extreme.dwellMs).toBe(70);
    expect(extreme.peekMs).toBe(60);
    expect(extreme.maxHiddenMs).toBe(140);
    expect(extreme.hitboxScale).toBe(0.72);
  });
});
