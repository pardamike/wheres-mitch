import type { DifficultyProfile, SceneId } from '../core/types';
import { createSceneInstance, type SceneDefinition, type SceneInstance } from '../world/scene';
import { getAirportDefinition } from './airport';
import { getKentuckyFairDefinition } from './kentucky-fair';
import { getWashingtonDefinition } from './washington';

export const sceneDefinitions: Readonly<Record<SceneId, SceneDefinition>> = Object.freeze({
  washington: getWashingtonDefinition(),
  fair: getKentuckyFairDefinition(),
  airport: getAirportDefinition(),
});

export function getSceneDefinition(sceneId: SceneId): SceneDefinition {
  return sceneDefinitions[sceneId];
}

export function createScene(
  sceneId: SceneId,
  seed: number,
  difficulty: DifficultyProfile,
): SceneInstance {
  return createSceneInstance(getSceneDefinition(sceneId), seed, difficulty);
}
