import type { SceneVariation } from '../world/scene';

export interface SceneStageLayers {
  background: SVGGElement;
  ambient: SVGGElement;
  occluders: SVGGElement;
}

export interface SceneStageBuildContext {
  layers: SceneStageLayers;
  variation: SceneVariation;
}

export interface SceneStagePresentation {
  updateAmbient(clockMs: number, reducedMotion: boolean): void;
}

export type SceneStageBuilder = (context: SceneStageBuildContext) => SceneStagePresentation;
