import { createRng, deriveSeed } from '../core/rng';
import type { DifficultyProfile, HideSpot, SceneId, Vec2 } from '../core/types';
import type { SceneStageBuilder } from '../render/scene-stage';
import { createCrowdActors, reactToMiss, updateCrowdActors } from './behaviors';
import type { CrowdActor } from './actor';
import { createMitch, updateMitch, type MitchRuntime } from './mitch';
import type { PathNetwork } from './path-network';

export type BehaviorKind = 'commute' | 'queue' | 'conversation' | 'sit' | 'interact' | 'observe';

export const behaviorKinds: readonly BehaviorKind[] = [
  'commute',
  'queue',
  'conversation',
  'sit',
  'interact',
  'observe',
];

export interface BehaviorAnchor {
  id: string;
  kind: BehaviorKind;
  nodeId: string;
}

export interface SceneOccluder {
  id: string;
  nodeId: string;
  opaque: boolean;
}

export interface SceneVariantOption {
  id: string;
}

export interface SceneVariantTables {
  palettes: readonly SceneVariantOption[];
  props: readonly SceneVariantOption[];
  crowd: readonly SceneVariantOption[];
  routes: readonly SceneVariantOption[];
  mitch: readonly SceneVariantOption[];
}

export interface SceneVariation {
  paletteId: string;
  propId: string;
  crowdId: string;
  routeId: string;
  mitchId: string;
}

export interface SceneSeedStreams {
  scene: number;
  crowd: number;
  mitch: number;
  cosmetic: number;
}

export interface SceneViewBox {
  width: number;
  height: number;
}

export interface SceneCutsceneLandmarks {
  captureDestination: Vec2;
  escapeEntry: Vec2;
  escapeExit: Vec2;
}

export interface SceneDefinition {
  id: SceneId;
  title: string;
  viewBox: SceneViewBox;
  routeNetwork: PathNetwork;
  behaviorAnchors: readonly BehaviorAnchor[];
  hideSpots: readonly SceneHideSpot[];
  occluders: readonly SceneOccluder[];
  variants: SceneVariantTables;
  actorRoleWeights: Readonly<Record<BehaviorKind, number>>;
  cutsceneLandmarks: SceneCutsceneLandmarks;
  stageBuilder: SceneStageBuilder;
}

export interface SceneHideSpot extends HideSpot {
  peekNodeId?: string;
}

export interface SceneInstance {
  definition: SceneDefinition;
  seed: number;
  seedStreams: SceneSeedStreams;
  variation: SceneVariation;
  difficulty: DifficultyProfile;
  actors: CrowdActor[];
  mitch: MitchRuntime;
}

export function createSceneSeedStreams(seed: number): SceneSeedStreams {
  return Object.freeze({
    scene: deriveSeed(seed, 'scene'),
    crowd: deriveSeed(seed, 'crowd'),
    mitch: deriveSeed(seed, 'mitch'),
    cosmetic: deriveSeed(seed, 'cosmetic'),
  });
}

function pickVariant(options: readonly SceneVariantOption[], seed: number): string {
  return createRng(seed).pick(options).id;
}

export function selectSceneVariation(
  definition: SceneDefinition,
  streams: SceneSeedStreams,
): SceneVariation {
  const sceneRng = createRng(streams.scene);
  return Object.freeze({
    paletteId: sceneRng.pick(definition.variants.palettes).id,
    routeId: sceneRng.pick(definition.variants.routes).id,
    crowdId: pickVariant(definition.variants.crowd, streams.crowd),
    mitchId: pickVariant(definition.variants.mitch, streams.mitch),
    propId: pickVariant(definition.variants.props, streams.cosmetic),
  });
}

function definitionForVariation(
  definition: SceneDefinition,
  variation: SceneVariation,
): SceneDefinition {
  const selectedMitchIndex = Math.max(
    0,
    definition.variants.mitch.findIndex((variant) => variant.id === variation.mitchId),
  );
  const selectedRouteIndex = Math.max(
    0,
    definition.variants.routes.findIndex((variant) => variant.id === variation.routeId),
  );
  const favoredSpot = selectedMitchIndex % definition.hideSpots.length;
  return {
    ...definition,
    actorRoleWeights: behaviorKinds.reduce<Readonly<Record<BehaviorKind, number>>>(
      (weights, kind, index) => {
        const multiplier = 0.82 + ((index + selectedRouteIndex) % 3) * 0.18;
        return { ...weights, [kind]: definition.actorRoleWeights[kind] * multiplier };
      },
      {} as Readonly<Record<BehaviorKind, number>>,
    ),
    hideSpots: definition.hideSpots.map((spot, index) => ({
      ...spot,
      weight: spot.weight * (index === favoredSpot ? 1.35 : 1),
    })),
  };
}

export function validateSceneDefinition(definition: SceneDefinition): void {
  if (
    !Number.isFinite(definition.viewBox.width) ||
    !Number.isFinite(definition.viewBox.height) ||
    definition.viewBox.width <= 0 ||
    definition.viewBox.height <= 0
  ) {
    throw new Error(`Scene ${definition.id} needs finite positive view-box bounds.`);
  }
  if (typeof definition.stageBuilder !== 'function') {
    throw new Error(`Scene ${definition.id} needs a stage builder.`);
  }
  for (const [name, options] of Object.entries(definition.variants)) {
    const ids = new Set<string>();
    if (options.length === 0) {
      throw new Error(`Scene ${definition.id} needs at least one ${name} variant.`);
    }
    for (const option of options) {
      if (!option.id || ids.has(option.id)) {
        throw new Error(`Scene ${definition.id} has invalid ${name} variant IDs.`);
      }
      ids.add(option.id);
    }
  }
  for (const kind of behaviorKinds) {
    const weight = definition.actorRoleWeights[kind];
    if (!Number.isFinite(weight) || weight <= 0) {
      throw new Error(`Scene ${definition.id} has an invalid ${kind} actor weight.`);
    }
  }
  for (const [landmark, point] of Object.entries(definition.cutsceneLandmarks)) {
    if (
      !Number.isFinite(point.x) ||
      !Number.isFinite(point.y) ||
      point.x < 0 ||
      point.x > definition.viewBox.width ||
      point.y < 0 ||
      point.y > definition.viewBox.height
    ) {
      throw new Error(`Scene ${definition.id} has an invalid ${landmark} cutscene landmark.`);
    }
  }
  const routeNodes = definition.routeNetwork.nodes;
  if (routeNodes.length === 0) {
    throw new Error(`Scene ${definition.id} needs at least one route node.`);
  }
  const firstNodeId = routeNodes[0]?.id;
  for (const node of routeNodes) {
    if (node.x > definition.viewBox.width || node.y > definition.viewBox.height) {
      throw new Error(`Route node ${node.id} is outside the ${definition.id} view box.`);
    }
    if (!firstNodeId || !definition.routeNetwork.isReachable(firstNodeId, node.id)) {
      throw new Error(`Route node ${node.id} is disconnected in scene ${definition.id}.`);
    }
  }
  const anchorIds = new Set<string>();
  for (const anchor of definition.behaviorAnchors) {
    if (!anchor.id || anchorIds.has(anchor.id)) {
      throw new Error(`Behavior anchors must have unique IDs: ${anchor.id || '(empty)'}`);
    }
    anchorIds.add(anchor.id);
    if (!behaviorKinds.includes(anchor.kind)) {
      throw new Error(`Behavior anchor ${anchor.id} has an unsupported routine.`);
    }
    definition.routeNetwork.getNode(anchor.nodeId);
  }
  for (const kind of behaviorKinds) {
    if (!definition.behaviorAnchors.some((anchor) => anchor.kind === kind)) {
      throw new Error(`Scene ${definition.id} is missing a ${kind} behavior anchor.`);
    }
  }
  const hideSpotIds = new Set<string>();
  for (const spot of definition.hideSpots) {
    if (!spot.id || hideSpotIds.has(spot.id)) {
      throw new Error(`Hide spots must have unique IDs: ${spot.id || '(empty)'}`);
    }
    if (
      !Number.isFinite(spot.position.x) ||
      !Number.isFinite(spot.position.y) ||
      spot.revealRatio < 0 ||
      spot.revealRatio > 1 ||
      spot.weight <= 0
    ) {
      throw new Error(`Hide spot ${spot.id} has invalid visibility or position data.`);
    }
    if (
      spot.position.x < 0 ||
      spot.position.x > definition.viewBox.width ||
      spot.position.y < 0 ||
      spot.position.y > definition.viewBox.height
    ) {
      throw new Error(`Hide spot ${spot.id} has out-of-bounds stage coordinates.`);
    }
    const approachNode = definition.routeNetwork.getNode(spot.approachNodeId);
    if (Math.hypot(spot.position.x - approachNode.x, spot.position.y - approachNode.y) > 0.001) {
      throw new Error(`Hide spot ${spot.id} must align with its authored approach node.`);
    }
    if (spot.peekNodeId) {
      definition.routeNetwork.getNode(spot.peekNodeId);
      if (!definition.routeNetwork.isReachable(spot.approachNodeId, spot.peekNodeId)) {
        throw new Error(`Hide spot ${spot.id} cannot reach its authored peek node.`);
      }
    }
    hideSpotIds.add(spot.id);
  }
  for (const spot of definition.hideSpots) {
    const reachableAlternative = definition.hideSpots.some(
      (alternative) =>
        alternative.id !== spot.id &&
        definition.routeNetwork.isReachable(spot.approachNodeId, alternative.approachNodeId),
    );
    if (!reachableAlternative) {
      throw new Error(`Hide spot ${spot.id} cannot reach another authored hiding spot.`);
    }
  }
  const occluderIds = new Set<string>();
  for (const occluder of definition.occluders) {
    if (!occluder.id || occluderIds.has(occluder.id)) {
      throw new Error(`Occluders must have unique IDs: ${occluder.id || '(empty)'}`);
    }
    if (typeof occluder.opaque !== 'boolean') {
      throw new Error(`Occluder ${occluder.id} must declare whether it is opaque.`);
    }
    definition.routeNetwork.getNode(occluder.nodeId);
    occluderIds.add(occluder.id);
  }
  for (const spot of definition.hideSpots) {
    if (spot.occluderId && !occluderIds.has(spot.occluderId)) {
      throw new Error(`Hide spot ${spot.id} references a missing occluder: ${spot.occluderId}`);
    }
  }
}

export function createSceneInstance(
  definition: SceneDefinition,
  seed: number,
  difficulty: DifficultyProfile,
): SceneInstance {
  validateSceneDefinition(definition);
  const seedStreams = createSceneSeedStreams(seed);
  const variation = selectSceneVariation(definition, seedStreams);
  const runtimeDefinition = definitionForVariation(definition, variation);
  return {
    definition: runtimeDefinition,
    seed: seed >>> 0,
    seedStreams,
    variation,
    difficulty,
    actors: createCrowdActors(runtimeDefinition, seedStreams.crowd, difficulty),
    mitch: createMitch(runtimeDefinition, seedStreams.mitch, difficulty),
  };
}

export function updateScene(instance: SceneInstance, deltaMs: number): void {
  updateCrowdActors(instance.actors, instance.definition, deltaMs);
  updateMitch(instance.mitch, instance.definition, deltaMs);
}

export function reactToSceneMiss(instance: SceneInstance, x: number, y: number): void {
  reactToMiss(instance.actors, x, y);
}
