import type { DifficultyProfile } from '../core/types';
import { buildAirportStage } from '../render/art/airport';
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
  { id: 'airport-west-entry', x: 95, y: 700, lane: 2, depthLane: 'front' },
  { id: 'airport-board', x: 255, y: 480, lane: 0, depthLane: 'back' },
  { id: 'airport-column', x: 385, y: 610, lane: 1, depthLane: 'mid' },
  { id: 'airport-column-peek', x: 492, y: 650, lane: 1, depthLane: 'mid' },
  { id: 'airport-gate', x: 540, y: 535, lane: 0, depthLane: 'back' },
  { id: 'airport-walkway-west', x: 478, y: 650, lane: 1, depthLane: 'mid' },
  { id: 'airport-walkway-center', x: 760, y: 710, lane: 2, depthLane: 'front' },
  { id: 'airport-seats', x: 700, y: 696, lane: 2, depthLane: 'front' },
  { id: 'airport-seats-peek', x: 833, y: 670, lane: 1, depthLane: 'mid' },
  { id: 'airport-cafe', x: 983, y: 548, lane: 1, depthLane: 'mid' },
  { id: 'airport-kiosk', x: 1008, y: 655, lane: 2, depthLane: 'front' },
  { id: 'airport-kiosk-peek', x: 1135, y: 690, lane: 2, depthLane: 'front' },
  { id: 'airport-cart', x: 1190, y: 755, lane: 2, depthLane: 'front' },
  { id: 'airport-cart-peek', x: 1320, y: 706, lane: 2, depthLane: 'front' },
  { id: 'airport-east-entry', x: 1350, y: 650, lane: 1, depthLane: 'mid' },
  { id: 'airport-window', x: 1110, y: 480, lane: 0, depthLane: 'back' },
  { id: 'airport-gate-queue', x: 548, y: 618, lane: 1, depthLane: 'mid' },
  { id: 'airport-cleaning', x: 900, y: 743, lane: 2, depthLane: 'front' },
  { id: 'airport-lounge', x: 742, y: 580, lane: 1, depthLane: 'mid' },
  { id: 'airport-runway', x: 1280, y: 482, lane: 0, depthLane: 'back' },
];

const edges: RouteEdge[] = [
  { from: 'airport-west-entry', to: 'airport-board' },
  { from: 'airport-west-entry', to: 'airport-column' },
  { from: 'airport-column', to: 'airport-column-peek' },
  { from: 'airport-column', to: 'airport-gate' },
  { from: 'airport-column-peek', to: 'airport-walkway-west' },
  { from: 'airport-walkway-west', to: 'airport-walkway-center' },
  { from: 'airport-walkway-west', to: 'airport-gate-queue' },
  { from: 'airport-gate-queue', to: 'airport-gate' },
  { from: 'airport-gate', to: 'airport-lounge' },
  { from: 'airport-lounge', to: 'airport-seats' },
  { from: 'airport-seats', to: 'airport-seats-peek' },
  { from: 'airport-seats-peek', to: 'airport-cafe' },
  { from: 'airport-walkway-center', to: 'airport-seats' },
  { from: 'airport-walkway-center', to: 'airport-cleaning' },
  { from: 'airport-cleaning', to: 'airport-kiosk' },
  { from: 'airport-kiosk', to: 'airport-kiosk-peek' },
  { from: 'airport-kiosk-peek', to: 'airport-cart' },
  { from: 'airport-cart', to: 'airport-cart-peek' },
  { from: 'airport-cart-peek', to: 'airport-east-entry' },
  { from: 'airport-east-entry', to: 'airport-runway' },
  { from: 'airport-runway', to: 'airport-window' },
  { from: 'airport-window', to: 'airport-cafe' },
  { from: 'airport-window', to: 'airport-lounge' },
  { from: 'airport-board', to: 'airport-gate' },
];

const behaviorAnchors: BehaviorAnchor[] = [
  { id: 'commute-west', kind: 'commute', nodeId: 'airport-west-entry' },
  { id: 'commute-east', kind: 'commute', nodeId: 'airport-east-entry' },
  { id: 'commute-walkway', kind: 'commute', nodeId: 'airport-walkway-center' },
  { id: 'queue-gate', kind: 'queue', nodeId: 'airport-gate-queue' },
  { id: 'queue-kiosk', kind: 'queue', nodeId: 'airport-kiosk-peek' },
  { id: 'chat-lounge', kind: 'conversation', nodeId: 'airport-lounge' },
  { id: 'chat-window', kind: 'conversation', nodeId: 'airport-window' },
  { id: 'sit-gate', kind: 'sit', nodeId: 'airport-seats' },
  { id: 'sit-lounge', kind: 'sit', nodeId: 'airport-lounge' },
  { id: 'interact-cafe', kind: 'interact', nodeId: 'airport-cafe' },
  { id: 'interact-kiosk', kind: 'interact', nodeId: 'airport-kiosk' },
  { id: 'observe-board', kind: 'observe', nodeId: 'airport-board' },
  { id: 'observe-runway', kind: 'observe', nodeId: 'airport-runway' },
  { id: 'observe-gate', kind: 'observe', nodeId: 'airport-gate' },
];

const hideSpots: SceneHideSpot[] = [
  {
    id: 'airport-gate-peek',
    position: { x: 540, y: 535 },
    approachNodeId: 'airport-gate',
    revealRatio: 1,
    weight: 1.35,
  },
  {
    id: 'airport-column',
    position: { x: 385, y: 610 },
    approachNodeId: 'airport-column',
    peekNodeId: 'airport-column-peek',
    occluderId: 'airport-column',
    revealRatio: 0.71,
    weight: 0.95,
  },
  {
    id: 'airport-seats',
    position: { x: 700, y: 696 },
    approachNodeId: 'airport-seats',
    peekNodeId: 'airport-seats-peek',
    occluderId: 'airport-seats',
    revealRatio: 0.72,
    weight: 1.05,
  },
  {
    id: 'airport-kiosk',
    position: { x: 1008, y: 655 },
    approachNodeId: 'airport-kiosk',
    peekNodeId: 'airport-kiosk-peek',
    occluderId: 'airport-kiosk',
    revealRatio: 0.68,
    weight: 1,
  },
  {
    id: 'airport-cart',
    position: { x: 1190, y: 755 },
    approachNodeId: 'airport-cart',
    peekNodeId: 'airport-cart-peek',
    occluderId: 'airport-cart',
    revealRatio: 0.76,
    weight: 0.86,
  },
];

const occluders: SceneOccluder[] = [
  { id: 'airport-column', nodeId: 'airport-column', opaque: true },
  { id: 'airport-seats', nodeId: 'airport-seats', opaque: true },
  { id: 'airport-kiosk', nodeId: 'airport-kiosk', opaque: true },
  { id: 'airport-cart', nodeId: 'airport-cart', opaque: true },
];

const airportDefinition: SceneDefinition = {
  id: 'airport',
  title: 'AIRPORT CONCOURSE',
  viewBox: { width: 1440, height: 900 },
  routeNetwork: new PathNetwork(nodes, edges),
  behaviorAnchors,
  hideSpots,
  occluders,
  variants: {
    palettes: [{ id: 'airport-morning' }, { id: 'airport-night' }],
    props: [{ id: 'airport-cafe-amber' }, { id: 'airport-gate-teal' }],
    crowd: [{ id: 'airport-travelers' }, { id: 'airport-crew-shift' }],
    routes: [{ id: 'airport-walkway-flow' }, { id: 'airport-gate-flow' }],
    mitch: [{ id: 'airport-gate-route' }, { id: 'airport-luggage-route' }],
  },
  actorRoleWeights: {
    commute: 1.45,
    queue: 1.3,
    conversation: 0.8,
    sit: 1.15,
    interact: 1,
    observe: 1.15,
  },
  cutsceneLandmarks: {
    captureDestination: { x: 1074, y: 570 },
    escapeEntry: { x: 1280, y: 108 },
    escapeExit: { x: 0, y: 0 },
  },
  stageBuilder: buildAirportStage,
};

export function getAirportDefinition(): SceneDefinition {
  return airportDefinition;
}

export function createAirportScene(seed: number, difficulty: DifficultyProfile): SceneInstance {
  return createSceneInstance(airportDefinition, seed, difficulty);
}
