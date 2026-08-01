import { describe, expect, it } from 'vitest';
import { difficultyForRound } from '../../src/core/difficulty';
import { createRng } from '../../src/core/rng';
import { sceneDefinitions } from '../../src/scenes/registry';
import { updateScene, createSceneInstance } from '../../src/world/scene';

function snapshot(seed: number) {
  const scene = createSceneInstance(sceneDefinitions.washington, seed, difficultyForRound(3));
  for (let frame = 0; frame < 320; frame += 1) {
    updateScene(scene, 40);
  }
  return {
    variation: scene.variation,
    actorProfile: scene.actors.slice(0, 10).map((actor) => ({
      routine: actor.routine,
      color: actor.color,
      accessory: actor.accessory,
    })),
    mitchTrace: scene.mitch.trace,
  };
}

describe('scene variation streams', () => {
  it('reproduces all selected variants and simulated world state for the same seed', () => {
    expect(snapshot(324001)).toEqual(snapshot(324001));
  });

  it('changes curated visual, crowd, route, or hiding details across authored seeds', () => {
    const first = snapshot(324001);
    const second = snapshot(324002);

    expect({
      variation: first.variation,
      actorProfile: first.actorProfile,
      mitchTrace: first.mitchTrace,
    }).not.toEqual({
      variation: second.variation,
      actorProfile: second.actorProfile,
      mitchTrace: second.mitchTrace,
    });
    expect(Object.values(first.variation)).toHaveLength(5);
  });

  it('keeps Mitch route decisions isolated from cosmetic stream consumption', () => {
    const profile = difficultyForRound(1);
    const first = createSceneInstance(sceneDefinitions.fair, 324002, profile);
    const second = createSceneInstance(sceneDefinitions.fair, 324002, profile);
    const cosmetic = createRng(first.seedStreams.cosmetic);
    for (let index = 0; index < 100; index += 1) {
      cosmetic.next();
    }
    for (let frame = 0; frame < 520; frame += 1) {
      updateScene(first, 35);
      updateScene(second, 35);
    }

    expect(first.mitch.trace).toEqual(second.mitch.trace);
    expect(first.mitch.position).toEqual(second.mitch.position);
  });
});
