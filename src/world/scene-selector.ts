import { createRng, deriveSeed, type SeededRng } from '../core/rng';
import type { SceneId } from '../core/types';

export const sceneIds = ['washington', 'fair', 'airport'] as const satisfies readonly SceneId[];

export interface SceneSelectorSnapshot {
  bag: readonly SceneId[];
  previousSceneId: SceneId | null;
}

function isSceneId(value: string | null): value is SceneId {
  return value !== null && sceneIds.includes(value as SceneId);
}

/**
 * Parses the intentionally small debug-only scene override. The returned value is always one of
 * the bundled scene IDs; arbitrary names never become paths, imports, or SVG input.
 */
export function parseSceneOverride(search: string): SceneId | null {
  const requested = new URLSearchParams(search).get('scene');
  return isSceneId(requested) ? requested : null;
}

/**
 * A run-scoped deterministic shuffle bag. Forced debug rounds never consume the bag or alter the
 * last normal scene, so removing `?scene=` resumes the exact normal sequence that was pending.
 */
export class SceneSelector {
  private rng: SeededRng;
  private bag: SceneId[] = [];
  private previousSceneId: SceneId | null = null;

  constructor(private readonly runSeed: number) {
    this.rng = createRng(deriveSeed(runSeed, 'scene-selector'));
  }

  reset(): void {
    this.rng = createRng(deriveSeed(this.runSeed, 'scene-selector'));
    this.bag = [];
    this.previousSceneId = null;
  }

  next(forcedSceneId: SceneId | null = null): SceneId {
    if (forcedSceneId) {
      return forcedSceneId;
    }
    if (this.bag.length === 0) {
      this.refill();
    }
    const sceneId = this.bag.shift();
    if (!sceneId) {
      throw new Error('Scene shuffle bag failed to produce a scene.');
    }
    this.previousSceneId = sceneId;
    return sceneId;
  }

  skip(rounds: number): void {
    if (!Number.isInteger(rounds) || rounds < 0) {
      throw new Error('Scene selector skip count must be a non-negative integer.');
    }
    for (let index = 0; index < rounds; index += 1) {
      this.next();
    }
  }

  snapshot(): SceneSelectorSnapshot {
    return Object.freeze({
      bag: Object.freeze([...this.bag]),
      previousSceneId: this.previousSceneId,
    });
  }

  private refill(): void {
    const nextBag = this.rng.shuffle(sceneIds);
    if (this.previousSceneId && nextBag[0] === this.previousSceneId) {
      const replacementIndex = nextBag.findIndex((sceneId) => sceneId !== this.previousSceneId);
      if (replacementIndex > 0) {
        const first = nextBag[0] as SceneId;
        nextBag[0] = nextBag[replacementIndex] as SceneId;
        nextBag[replacementIndex] = first;
      }
    }
    this.bag = nextBag;
  }
}
