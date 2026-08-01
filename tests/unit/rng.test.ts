import { describe, expect, it } from 'vitest';
import { createRng, deriveSeed, parseSeedFromSearch, parseUint32 } from '../../src/core/rng';

describe('seeded randomness', () => {
  it('reproduces the exact same sequence for the same seed', () => {
    const first = createRng(324001);
    const second = createRng(324001);
    const firstSequence = Array.from({ length: 5 }, () => first.next());
    const secondSequence = Array.from({ length: 5 }, () => second.next());

    expect(firstSequence).toEqual(secondSequence);
    expect(firstSequence).toEqual([
      0.38889683270826936, 0.3706118210684508, 0.40637836419045925, 0.20438421866856515,
      0.7135520041920245,
    ]);
  });

  it('derives stable but distinct named streams', () => {
    const crowdSeed = deriveSeed(324001, 'round-1-crowd');
    const mitchSeed = deriveSeed(324001, 'round-1-mitch');

    expect(crowdSeed).toBe(deriveSeed(324001, 'round-1-crowd'));
    expect(crowdSeed).not.toBe(mitchSeed);
  });

  it('produces bounded integer and shuffled values deterministically', () => {
    const first = createRng(7);
    const second = createRng(7);

    expect(first.int(2, 7)).toBeGreaterThanOrEqual(2);
    expect(first.int(2, 7)).toBeLessThan(7);
    expect(second.shuffle(['a', 'b', 'c', 'd'])).toEqual(
      createRng(7).shuffle(['a', 'b', 'c', 'd']),
    );
  });

  it('validates seed query parameters as uint32 values', () => {
    expect(parseUint32('0')).toBe(0);
    expect(parseUint32('4294967295')).toBe(4_294_967_295);
    expect(parseUint32('4294967296')).toBeNull();
    expect(parseUint32('-1')).toBeNull();
    expect(parseUint32('3.2')).toBeNull();
    expect(parseUint32(' 3')).toBeNull();
    expect(parseSeedFromSearch('?seed=324001')).toBe(324001);
    expect(parseSeedFromSearch('?seed=oops')).toBeNull();
  });
});
