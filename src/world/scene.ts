import type { DifficultyProfile, HideSpot, SceneId } from '../core/types';
import { createCrowdActors, reactToMiss, updateCrowdActors } from './behaviors';
import type { CrowdActor } from './actor';
import { createMitch, updateMitch, type MitchRuntime } from './mitch';
import type { PathNetwork } from './path-network';

export type BehaviorKind = 'commute' | 'queue' | 'conversation' | 'sit' | 'interact' | 'observe';

const behaviorKinds: readonly BehaviorKind[] = [
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

export interface SceneDefinition {
  id: SceneId;
  title: string;
  routeNetwork: PathNetwork;
  behaviorAnchors: readonly BehaviorAnchor[];
  hideSpots: readonly SceneHideSpot[];
  occluders: readonly SceneOccluder[];
}

export interface SceneHideSpot extends HideSpot {
  peekNodeId?: string;
}

export interface SceneInstance {
  definition: SceneDefinition;
  seed: number;
  difficulty: DifficultyProfile;
  actors: CrowdActor[];
  mitch: MitchRuntime;
}

export function validateSceneDefinition(definition: SceneDefinition): void {
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
      spot.position.x > 1440 ||
      spot.position.y < 0 ||
      spot.position.y > 900
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
  return {
    definition,
    seed: seed >>> 0,
    difficulty,
    actors: createCrowdActors(definition, seed, difficulty),
    mitch: createMitch(definition, seed, difficulty),
  };
}

export function updateScene(instance: SceneInstance, deltaMs: number): void {
  updateCrowdActors(instance.actors, instance.definition, deltaMs);
  updateMitch(instance.mitch, instance.definition, deltaMs);
}

export function reactToSceneMiss(instance: SceneInstance, x: number, y: number): void {
  reactToMiss(instance.actors, x, y);
}
