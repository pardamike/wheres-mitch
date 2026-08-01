import type { DifficultyProfile } from '../core/types';
import { buildFairStage } from '../render/art/fair';
import { PathNetwork, type RouteEdge, type RouteNode } from '../world/path-network';
import {
  createSceneInstance,
  type BehaviorAnchor,
  type SceneDefinition,
  type SceneHideSpot,
  type SceneInstance,
  type SceneOccluder,
} from '../world/scene';

const nodes: RouteNode[] = [
  { id: 'fair-west-entry', x: 92, y: 710, lane: 2, depthLane: 'front' },
  { id: 'fair-game', x: 208, y: 682, lane: 1, depthLane: 'mid' },
  { id: 'fair-prize-wall', x: 401, y: 626, lane: 1, depthLane: 'mid' },
  { id: 'fair-prize-peek', x: 704, y: 642, lane: 1, depthLane: 'mid' },
  { id: 'fair-booth', x: 511, y: 594, lane: 1, depthLane: 'mid' },
  { id: 'fair-booth-peek', x: 680, y: 642, lane: 1, depthLane: 'mid' },
  { id: 'fair-stage', x: 702, y: 547, lane: 0, depthLane: 'back' },
  { id: 'fair-pavilion', x: 670, y: 456, lane: 0, depthLane: 'back' },
  { id: 'fair-picnic', x: 655, y: 730, lane: 2, depthLane: 'front' },
  { id: 'fair-food', x: 888, y: 662, lane: 1, depthLane: 'mid' },
  { id: 'fair-food-queue', x: 949, y: 690, lane: 2, depthLane: 'front' },
  { id: 'fair-hay', x: 1048, y: 638, lane: 1, depthLane: 'mid' },
  { id: 'fair-hay-peek', x: 1280, y: 690, lane: 1, depthLane: 'mid' },
  { id: 'fair-wheel', x: 1128, y: 454, lane: 0, depthLane: 'back' },
  { id: 'fair-wheel-queue', x: 1190, y: 582, lane: 1, depthLane: 'mid' },
  { id: 'fair-fence', x: 806, y: 748, lane: 2, depthLane: 'front' },
  { id: 'fair-fence-peek', x: 965, y: 650, lane: 1, depthLane: 'mid' },
  { id: 'fair-east-entry', x: 1332, y: 700, lane: 2, depthLane: 'front' },
  { id: 'fair-livestock', x: 412, y: 570, lane: 0, depthLane: 'back' },
  { id: 'fair-barn', x: 196, y: 550, lane: 0, depthLane: 'back' },
  { id: 'fair-parade', x: 1168, y: 757, lane: 2, depthLane: 'front' },
];

const edges: RouteEdge[] = [
  { from: 'fair-west-entry', to: 'fair-game' },
  { from: 'fair-game', to: 'fair-prize-wall' },
  { from: 'fair-prize-wall', to: 'fair-prize-peek' },
  { from: 'fair-prize-wall', to: 'fair-booth' },
  { from: 'fair-booth', to: 'fair-booth-peek' },
  { from: 'fair-booth', to: 'fair-stage' },
  { from: 'fair-stage', to: 'fair-pavilion' },
  { from: 'fair-stage', to: 'fair-picnic' },
  { from: 'fair-picnic', to: 'fair-fence' },
  { from: 'fair-fence', to: 'fair-fence-peek' },
  { from: 'fair-fence-peek', to: 'fair-food-queue' },
  { from: 'fair-food-queue', to: 'fair-food' },
  { from: 'fair-food', to: 'fair-hay' },
  { from: 'fair-hay', to: 'fair-hay-peek' },
  { from: 'fair-hay', to: 'fair-wheel-queue' },
  { from: 'fair-wheel-queue', to: 'fair-wheel' },
  { from: 'fair-wheel-queue', to: 'fair-east-entry' },
  { from: 'fair-east-entry', to: 'fair-parade' },
  { from: 'fair-parade', to: 'fair-hay-peek' },
  { from: 'fair-game', to: 'fair-barn' },
  { from: 'fair-barn', to: 'fair-livestock' },
  { from: 'fair-livestock', to: 'fair-stage' },
  { from: 'fair-livestock', to: 'fair-prize-wall' },
  { from: 'fair-booth-peek', to: 'fair-food' },
];

const behaviorAnchors: BehaviorAnchor[] = [
  { id: 'commute-west', kind: 'commute', nodeId: 'fair-west-entry' },
  { id: 'commute-east', kind: 'commute', nodeId: 'fair-east-entry' },
  { id: 'commute-parade', kind: 'commute', nodeId: 'fair-parade' },
  { id: 'queue-food', kind: 'queue', nodeId: 'fair-food-queue' },
  { id: 'queue-wheel', kind: 'queue', nodeId: 'fair-wheel-queue' },
  { id: 'chat-picnic', kind: 'conversation', nodeId: 'fair-picnic' },
  { id: 'chat-game', kind: 'conversation', nodeId: 'fair-game' },
  { id: 'sit-picnic', kind: 'sit', nodeId: 'fair-picnic' },
  { id: 'sit-fence', kind: 'sit', nodeId: 'fair-fence' },
  { id: 'interact-food', kind: 'interact', nodeId: 'fair-food' },
  { id: 'interact-game', kind: 'interact', nodeId: 'fair-game' },
  { id: 'observe-stage', kind: 'observe', nodeId: 'fair-stage' },
  { id: 'observe-livestock', kind: 'observe', nodeId: 'fair-livestock' },
  { id: 'observe-wheel', kind: 'observe', nodeId: 'fair-wheel' },
];

const hideSpots: SceneHideSpot[] = [
  {
    id: 'fair-stage-peek',
    position: { x: 702, y: 547 },
    approachNodeId: 'fair-stage',
    revealRatio: 1,
    weight: 1.35,
  },
  {
    id: 'fair-prize-wall',
    position: { x: 401, y: 626 },
    approachNodeId: 'fair-prize-wall',
    peekNodeId: 'fair-prize-peek',
    occluderId: 'fair-prize-wall',
    revealRatio: 0.72,
    weight: 1,
  },
  {
    id: 'fair-booth',
    position: { x: 511, y: 594 },
    approachNodeId: 'fair-booth',
    peekNodeId: 'fair-booth-peek',
    occluderId: 'fair-booth',
    revealRatio: 0.68,
    weight: 1,
  },
  {
    id: 'fair-hay',
    position: { x: 1048, y: 638 },
    approachNodeId: 'fair-hay',
    peekNodeId: 'fair-hay-peek',
    occluderId: 'fair-hay',
    revealRatio: 0.7,
    weight: 1.05,
  },
  {
    id: 'fair-fence',
    position: { x: 806, y: 748 },
    approachNodeId: 'fair-fence',
    peekNodeId: 'fair-fence-peek',
    occluderId: 'fair-fence',
    revealRatio: 0.78,
    weight: 0.82,
  },
];

const occluders: SceneOccluder[] = [
  { id: 'fair-prize-wall', nodeId: 'fair-prize-wall', opaque: true },
  { id: 'fair-booth', nodeId: 'fair-booth', opaque: true },
  { id: 'fair-hay', nodeId: 'fair-hay', opaque: true },
  { id: 'fair-fence', nodeId: 'fair-fence', opaque: true },
];

const kentuckyFairDefinition: SceneDefinition = {
  id: 'fair',
  title: 'KENTUCKY COUNTY FAIR',
  viewBox: { width: 1440, height: 900 },
  routeNetwork: new PathNetwork(nodes, edges),
  behaviorAnchors,
  hideSpots,
  occluders,
  variants: {
    palettes: [{ id: 'fair-late-day' }, { id: 'fair-sunset' }],
    props: [{ id: 'fair-blue-canopy' }, { id: 'fair-neon-booths' }],
    crowd: [{ id: 'fair-families' }, { id: 'fair-vendors' }],
    routes: [{ id: 'fair-midway-loop' }, { id: 'fair-pavilion-loop' }],
    mitch: [{ id: 'fair-stage-route' }, { id: 'fair-hay-route' }],
  },
  actorRoleWeights: {
    commute: 1.15,
    queue: 1.3,
    conversation: 1.15,
    sit: 0.95,
    interact: 1.35,
    observe: 1.2,
  },
  cutsceneLandmarks: {
    captureDestination: { x: 1082, y: 572 },
    escapeEntry: { x: 1270, y: 112 },
    escapeExit: { x: 0, y: 0 },
  },
  stageBuilder: buildFairStage,
};

export function getKentuckyFairDefinition(): SceneDefinition {
  return kentuckyFairDefinition;
}

export function createKentuckyFairScene(
  seed: number,
  difficulty: DifficultyProfile,
): SceneInstance {
  return createSceneInstance(kentuckyFairDefinition, seed, difficulty);
}
