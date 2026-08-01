import { createRng, deriveSeed } from '../core/rng';
import type { DifficultyProfile } from '../core/types';
import type { CrowdActor, CrowdAccessory, CrowdPose } from './actor';
import { moveTowards } from './path-network';
import type { BehaviorAnchor, BehaviorKind, SceneDefinition } from './scene';

const clothing = ['#D9443F', '#2E5EAA', '#557A46', '#F2C14E', '#8A5B9E', '#D4794A', '#4D718C'];
const skinTones = ['#F2C7A5', '#D99D76', '#B97654', '#8C593F', '#F7D5B6'];
const hairColors = ['#2E241E', '#4A3428', '#8A5A3B', '#C9B08A', '#172033'];
const accessories: CrowdAccessory[] = ['hat', 'bag', 'coffee', 'camera', 'none'];
const routines: BehaviorKind[] = ['commute', 'queue', 'conversation', 'sit', 'interact', 'observe'];

function poseForRoutine(routine: BehaviorKind): CrowdPose {
  switch (routine) {
    case 'queue':
      return 'queue';
    case 'conversation':
      return 'chat';
    case 'sit':
      return 'sit';
    case 'interact':
      return 'interact';
    case 'observe':
      return 'observe';
    default:
      return 'walk';
  }
}

function anchorsFor(definition: SceneDefinition, routine: BehaviorKind): readonly BehaviorAnchor[] {
  const anchors = definition.behaviorAnchors.filter((anchor) => anchor.kind === routine);
  if (anchors.length === 0) {
    throw new Error(`Scene ${definition.id} is missing ${routine} anchors.`);
  }
  return anchors;
}

function durationFor(actor: CrowdActor, routine: BehaviorKind): number {
  const baseline =
    routine === 'queue'
      ? 2800
      : routine === 'conversation'
        ? 2400
        : routine === 'sit'
          ? 3800
          : 2000;
  return baseline + actor.rng.int(0, 1600);
}

function setDestination(
  actor: CrowdActor,
  definition: SceneDefinition,
  routine: BehaviorKind,
): void {
  const anchors = anchorsFor(definition, routine);
  const alternatives = anchors.filter((anchor) => anchor.nodeId !== actor.currentNodeId);
  const anchor = actor.rng.pick(alternatives.length > 0 ? alternatives : anchors);
  actor.routine = routine;
  actor.pose = poseForRoutine(routine);
  actor.routineElapsedMs = 0;
  actor.routineDurationMs = durationFor(actor, routine);
  actor.targetNodeId = anchor.nodeId;
  actor.route = definition.routeNetwork.findPath(actor.currentNodeId, anchor.nodeId);
  actor.routeCursor = 1;
}

function chooseNextRoutine(actor: CrowdActor): BehaviorKind {
  const offset = actor.rng.int(1, routines.length);
  const currentIndex = Math.max(0, routines.indexOf(actor.routine));
  return routines[(currentIndex + offset) % routines.length] as BehaviorKind;
}

function chooseInitialRoutine(
  root: ReturnType<typeof createRng>,
  definition: SceneDefinition,
): BehaviorKind {
  const totalWeight = routines.reduce(
    (total, routine) => total + definition.actorRoleWeights[routine],
    0,
  );
  let choice = root.next() * totalWeight;
  for (const routine of routines) {
    choice -= definition.actorRoleWeights[routine];
    if (choice <= 0) {
      return routine;
    }
  }
  return routines[routines.length - 1] as BehaviorKind;
}

function advanceActor(
  actor: CrowdActor,
  definition: SceneDefinition,
  distanceBudget: number,
): number {
  let remaining = distanceBudget;
  while (remaining > 0 && actor.routeCursor < actor.route.length) {
    const nextNode = definition.routeNetwork.getNode(actor.route[actor.routeCursor] as string);
    const beforeX = actor.position.x;
    const moved = moveTowards(actor.position, nextNode, remaining);
    remaining -= moved.travelled;
    actor.facing = nextNode.x >= beforeX ? 1 : -1;
    if (!moved.reached) {
      break;
    }
    actor.currentNodeId = nextNode.id;
    actor.depthLane = nextNode.depthLane;
    actor.routeCursor += 1;
  }
  return remaining;
}

export function createCrowdActors(
  definition: SceneDefinition,
  crowdSeed: number,
  difficulty: DifficultyProfile,
): CrowdActor[] {
  const root = createRng(crowdSeed);
  const actors: CrowdActor[] = [];
  for (let index = 0; index < difficulty.crowdCount; index += 1) {
    const routine = chooseInitialRoutine(root, definition);
    const actorRng = createRng(deriveSeed(crowdSeed, `actor-${index}`));
    const anchor = actorRng.pick(anchorsFor(definition, routine));
    const node = definition.routeNetwork.getNode(anchor.nodeId);
    actors.push({
      id: `actor-${index}`,
      routine,
      previousRoutine: null,
      pose: poseForRoutine(routine),
      position: { x: node.x, y: node.y },
      route: [node.id],
      routeCursor: 1,
      currentNodeId: node.id,
      targetNodeId: node.id,
      speed: (54 + root.int(0, 42)) * difficulty.crowdSpeed,
      routineElapsedMs: root.int(0, 1200),
      routineDurationMs: 1300 + root.int(0, 1800),
      reactionRemainingMs: 0,
      facing: root.next() > 0.5 ? 1 : -1,
      depthLane: node.depthLane,
      scale: node.depthLane === 'back' ? 0.68 + root.next() * 0.16 : 0.8 + root.next() * 0.24,
      color: root.pick(clothing),
      skin: root.pick(skinTones),
      hair: root.pick(hairColors),
      accessory: root.pick(accessories),
      phase: root.next() * Math.PI * 2,
      rng: actorRng,
    });
  }
  return actors;
}

export function updateCrowdActors(
  actors: readonly CrowdActor[],
  definition: SceneDefinition,
  deltaMs: number,
): void {
  for (const actor of actors) {
    if (actor.reactionRemainingMs > 0) {
      actor.reactionRemainingMs = Math.max(0, actor.reactionRemainingMs - deltaMs);
      if (actor.reactionRemainingMs === 0) {
        actor.routine = actor.previousRoutine ?? actor.routine;
        actor.previousRoutine = null;
        actor.pose = poseForRoutine(actor.routine);
      }
      continue;
    }
    if (actor.routeCursor < actor.route.length) {
      advanceActor(actor, definition, (actor.speed * deltaMs) / 1000);
      actor.pose = 'walk';
      continue;
    }
    actor.routineElapsedMs += deltaMs;
    actor.pose = poseForRoutine(actor.routine);
    if (actor.routineElapsedMs >= actor.routineDurationMs) {
      setDestination(actor, definition, chooseNextRoutine(actor));
    }
  }
}

export function reactToMiss(actors: readonly CrowdActor[], x: number, y: number): void {
  let reactions = 0;
  for (const actor of actors) {
    if (reactions >= 4 || actor.reactionRemainingMs > 0) {
      continue;
    }
    if (Math.hypot(actor.position.x - x, actor.position.y - y) <= 170) {
      actor.previousRoutine = actor.routine;
      actor.pose = 'react';
      actor.reactionRemainingMs = 480;
      reactions += 1;
    }
  }
}
