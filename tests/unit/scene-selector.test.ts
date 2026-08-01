import { describe, expect, it } from 'vitest';
import { parseSceneOverride, SceneSelector, sceneIds } from '../../src/world/scene-selector';

function take(selector: SceneSelector, count: number): string[] {
  return Array.from({ length: count }, () => selector.next());
}

describe('run-scoped scene shuffle bag', () => {
  it('emits every scene exactly once before it refills', () => {
    const sequence = take(new SceneSelector(324001), sceneIds.length);
    expect(new Set(sequence)).toEqual(new Set(sceneIds));
  });

  it('avoids immediate repeats through thirty deterministic rounds', () => {
    const sequence = take(new SceneSelector(324002), 30);
    for (let index = 1; index < sequence.length; index += 1) {
      expect(sequence[index]).not.toBe(sequence[index - 1]);
    }
    for (let index = 0; index < sequence.length; index += sceneIds.length) {
      expect(new Set(sequence.slice(index, index + sceneIds.length))).toEqual(new Set(sceneIds));
    }
  });

  it('is reproducible and reset restores the original run order', () => {
    const first = new SceneSelector(324003);
    const second = new SceneSelector(324003);
    const original = take(first, 12);
    expect(original).toEqual(take(second, 12));

    first.reset();
    expect(take(first, 12)).toEqual(original);
  });

  it('allows only bundled scene overrides without consuming the normal bag', () => {
    expect(parseSceneOverride('?scene=fair')).toBe('fair');
    expect(parseSceneOverride('?scene=../../anything')).toBeNull();
    expect(parseSceneOverride('?scene=made-up')).toBeNull();

    const normal = new SceneSelector(99);
    const forced = new SceneSelector(99);
    expect(forced.next('airport')).toBe('airport');
    expect(forced.next()).toBe(normal.next());
    expect(forced.snapshot()).toEqual(normal.snapshot());
  });
});
