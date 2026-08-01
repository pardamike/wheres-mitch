import type { DifficultyProfile } from '../core/types';
import { buildWashingtonStage } from '../render/art/washington';
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
  { id: 'metro', x: 252, y: 650, lane: 0, depthLane: 'front' },
  { id: 'west-cross', x: 445, y: 644, lane: 1, depthLane: 'mid' },
  { id: 'tree-west', x: 402, y: 493, lane: 1, depthLane: 'mid' },
  { id: 'tree-west-peek', x: 500, y: 548, lane: 1, depthLane: 'mid' },
  { id: 'shelter', x: 668, y: 550, lane: 1, depthLane: 'mid' },
  { id: 'shelter-peek', x: 752, y: 562, lane: 1, depthLane: 'mid' },
  { id: 'capitol-steps', x: 770, y: 554, lane: 0, depthLane: 'back' },
  { id: 'mid-cross', x: 780, y: 630, lane: 1, depthLane: 'mid' },
  { id: 'sign', x: 873, y: 578, lane: 1, depthLane: 'mid' },
  { id: 'queue-a', x: 920, y: 676, lane: 2, depthLane: 'front' },
  { id: 'queue-b', x: 963, y: 676, lane: 2, depthLane: 'front' },
  { id: 'food-cart', x: 1056, y: 674, lane: 2, depthLane: 'front' },
  { id: 'east-cross', x: 1160, y: 641, lane: 1, depthLane: 'mid' },
  { id: 'tree-east', x: 1314, y: 520, lane: 1, depthLane: 'mid' },
  { id: 'tree-east-peek', x: 1202, y: 568, lane: 1, depthLane: 'mid' },
  { id: 'bench', x: 520, y: 758, lane: 2, depthLane: 'front' },
  { id: 'newspapers', x: 398, y: 742, lane: 2, depthLane: 'front' },
  { id: 'south-entry', x: 790, y: 786, lane: 2, depthLane: 'front' },
  { id: 'northwest-entry', x: 300, y: 520, lane: 0, depthLane: 'back' },
  { id: 'northeast-entry', x: 1130, y: 530, lane: 0, depthLane: 'back' },
];

const edges: RouteEdge[] = [
  { from: 'metro', to: 'west-cross' },
  { from: 'west-cross', to: 'tree-west' },
  { from: 'tree-west', to: 'tree-west-peek' },
  { from: 'west-cross', to: 'shelter' },
  { from: 'shelter', to: 'shelter-peek' },
  { from: 'west-cross', to: 'bench' },
  { from: 'west-cross', to: 'newspapers' },
  { from: 'tree-west', to: 'northwest-entry' },
  { from: 'shelter', to: 'capitol-steps' },
  { from: 'shelter', to: 'mid-cross' },
  { from: 'capitol-steps', to: 'mid-cross' },
  { from: 'mid-cross', to: 'sign' },
  { from: 'mid-cross', to: 'queue-a' },
  { from: 'mid-cross', to: 'south-entry' },
  { from: 'sign', to: 'queue-a' },
  { from: 'queue-a', to: 'queue-b' },
  { from: 'queue-b', to: 'food-cart' },
  { from: 'food-cart', to: 'east-cross' },
  { from: 'east-cross', to: 'tree-east' },
  { from: 'tree-east', to: 'tree-east-peek' },
  { from: 'east-cross', to: 'northeast-entry' },
  { from: 'east-cross', to: 'south-entry' },
];

const behaviorAnchors: BehaviorAnchor[] = [
  { id: 'commute-metro', kind: 'commute', nodeId: 'metro' },
  { id: 'commute-south', kind: 'commute', nodeId: 'south-entry' },
  { id: 'commute-northwest', kind: 'commute', nodeId: 'northwest-entry' },
  { id: 'commute-northeast', kind: 'commute', nodeId: 'northeast-entry' },
  { id: 'queue-a', kind: 'queue', nodeId: 'queue-a' },
  { id: 'queue-b', kind: 'queue', nodeId: 'queue-b' },
  { id: 'chat-west', kind: 'conversation', nodeId: 'west-cross' },
  { id: 'chat-east', kind: 'conversation', nodeId: 'east-cross' },
  { id: 'sit-bench', kind: 'sit', nodeId: 'bench' },
  { id: 'sit-metro', kind: 'sit', nodeId: 'metro' },
  { id: 'interact-food', kind: 'interact', nodeId: 'food-cart' },
  { id: 'interact-newspapers', kind: 'interact', nodeId: 'newspapers' },
  { id: 'observe-capitol', kind: 'observe', nodeId: 'capitol-steps' },
  { id: 'observe-sign', kind: 'observe', nodeId: 'sign' },
];

const hideSpots: SceneHideSpot[] = [
  {
    id: 'crosswalk-peek',
    position: { x: 780, y: 630 },
    approachNodeId: 'mid-cross',
    revealRatio: 1,
    weight: 1.4,
  },
  {
    id: 'shelter-panel',
    position: { x: 668, y: 550 },
    peekNodeId: 'shelter-peek',
    approachNodeId: 'shelter',
    occluderId: 'shelter-panel',
    revealRatio: 0.72,
    weight: 1,
  },
  {
    id: 'west-tree',
    position: { x: 402, y: 493 },
    peekNodeId: 'tree-west-peek',
    approachNodeId: 'tree-west',
    occluderId: 'west-tree',
    revealRatio: 0.68,
    weight: 0.9,
  },
  {
    id: 'east-tree',
    position: { x: 1314, y: 520 },
    peekNodeId: 'tree-east-peek',
    approachNodeId: 'tree-east',
    occluderId: 'east-tree',
    revealRatio: 0.7,
    weight: 0.9,
  },
  {
    id: 'food-queue',
    position: { x: 963, y: 676 },
    approachNodeId: 'queue-b',
    revealRatio: 0.92,
    weight: 1.1,
  },
];

const occluders: SceneOccluder[] = [
  { id: 'shelter-panel', nodeId: 'shelter', opaque: true },
  { id: 'west-tree', nodeId: 'tree-west', opaque: true },
  { id: 'east-tree', nodeId: 'tree-east', opaque: true },
];

const washingtonDefinition: SceneDefinition = {
  id: 'washington',
  title: 'WASHINGTON STREET',
  viewBox: { width: 1440, height: 900 },
  routeNetwork: new PathNetwork(nodes, edges),
  behaviorAnchors,
  hideSpots,
  occluders,
  variants: {
    palettes: [{ id: 'washington-day' }, { id: 'washington-dusk' }],
    props: [{ id: 'washington-red-awning' }, { id: 'washington-blue-awning' }],
    crowd: [{ id: 'washington-commuters' }, { id: 'washington-tourists' }],
    routes: [{ id: 'washington-crosswalks' }, { id: 'washington-civic-loop' }],
    mitch: [{ id: 'washington-central' }, { id: 'washington-trees' }],
  },
  actorRoleWeights: {
    commute: 1.4,
    queue: 1,
    conversation: 1,
    sit: 0.8,
    interact: 1,
    observe: 0.9,
  },
  cutsceneLandmarks: {
    captureDestination: { x: 1125, y: 575 },
    escapeEntry: { x: 1280, y: 108 },
    escapeExit: { x: 0, y: 0 },
  },
  stageBuilder: buildWashingtonStage,
};

export function getWashingtonDefinition(): SceneDefinition {
  return washingtonDefinition;
}

export function createWashingtonScene(seed: number, difficulty: DifficultyProfile): SceneInstance {
  return createSceneInstance(washingtonDefinition, seed, difficulty);
}
