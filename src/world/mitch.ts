import { createRng, deriveSeed, type SeededRng } from '../core/rng';
import type { DifficultyProfile, Vec2 } from '../core/types';
import { moveTowards } from './path-network';
import type { SceneDefinition, SceneHideSpot } from './scene';

export type MitchMode = 'peek' | 'deciding' | 'transit' | 'hidden' | 'emerge';

export interface MitchRuntime {
  mode: MitchMode;
  position: Vec2;
  currentNodeId: string;
  route: string[];
  routeCursor: number;
  currentSpotId: string;
  destinationSpotId: string | null;
  phaseElapsedMs: number;
  phaseDurationMs: number;
  fullyHiddenElapsedMs: number;
  clickable: boolean;
  visibleRatio: number;
  profile: DifficultyProfile;
  rng: SeededRng;
  trace: string[];
}

function spotById(definition: SceneDefinition, id: string): SceneHideSpot {
  const spot = definition.hideSpots.find((candidate) => candidate.id === id);
  if (!spot) {
    throw new Error(`Unknown Mitch hiding spot: ${id}`);
  }
  return spot;
}

function chooseSpot(mitch: MitchRuntime, definition: SceneDefinition): SceneHideSpot {
  const candidates = definition.hideSpots.filter(
    (spot) =>
      spot.id !== mitch.currentSpotId &&
      definition.routeNetwork.isReachable(mitch.currentNodeId, spot.approachNodeId),
  );
  const available = candidates.length > 0 ? candidates : definition.hideSpots;
  const totalWeight = available.reduce((total, spot) => total + spot.weight, 0);
  let choice = mitch.rng.next() * totalWeight;
  for (const spot of available) {
    choice -= spot.weight;
    if (choice <= 0) {
      return spot;
    }
  }
  return available[available.length - 1] as SceneHideSpot;
}

function beginTransit(mitch: MitchRuntime, definition: SceneDefinition): void {
  const destination = chooseSpot(mitch, definition);
  mitch.destinationSpotId = destination.id;
  mitch.route = definition.routeNetwork.findPath(mitch.currentNodeId, destination.approachNodeId);
  mitch.routeCursor = 1;
  mitch.mode = 'transit';
  mitch.phaseElapsedMs = 0;
  mitch.phaseDurationMs = mitch.profile.routeDecisionMs;
  mitch.clickable = true;
  mitch.visibleRatio = 1;
  mitch.trace.push(`transit:${mitch.currentNodeId}->${destination.id}`);
}

function beginSpotPhase(mitch: MitchRuntime, definition: SceneDefinition): void {
  const destination = mitch.destinationSpotId;
  if (!destination) {
    beginTransit(mitch, definition);
    return;
  }
  const spot = spotById(definition, destination);
  mitch.currentSpotId = spot.id;
  mitch.currentNodeId = spot.approachNodeId;
  mitch.destinationSpotId = null;
  mitch.fullyHiddenElapsedMs = 0;
  if (spot.occluderId) {
    mitch.mode = 'hidden';
    mitch.phaseElapsedMs = 0;
    mitch.phaseDurationMs = Math.min(mitch.profile.dwellMs, mitch.profile.maxHiddenMs);
    mitch.clickable = false;
    mitch.visibleRatio = 0;
    mitch.trace.push(`hidden:${spot.id}`);
  } else {
    beginPeek(mitch, spot);
  }
}

function beginPeek(mitch: MitchRuntime, spot: SceneHideSpot): void {
  mitch.mode = 'peek';
  mitch.phaseElapsedMs = 0;
  mitch.phaseDurationMs = mitch.profile.peekMs;
  mitch.clickable = true;
  mitch.visibleRatio = spot.revealRatio;
  mitch.trace.push(`peek:${spot.id}`);
}

function beginDecision(mitch: MitchRuntime): void {
  mitch.mode = 'deciding';
  mitch.phaseElapsedMs = 0;
  mitch.phaseDurationMs = mitch.profile.routeDecisionMs;
  mitch.clickable = true;
  mitch.visibleRatio = 1;
  mitch.trace.push(`deciding:${mitch.currentSpotId}`);
}

function beginEmerge(mitch: MitchRuntime, definition: SceneDefinition, spot: SceneHideSpot): void {
  const peekNodeId = spot.peekNodeId ?? spot.approachNodeId;
  if (peekNodeId === mitch.currentNodeId) {
    beginPeek(mitch, spot);
    return;
  }
  mitch.route = definition.routeNetwork.findPath(mitch.currentNodeId, peekNodeId);
  mitch.routeCursor = 1;
  mitch.mode = 'emerge';
  mitch.phaseElapsedMs = 0;
  mitch.phaseDurationMs = 0;
  mitch.clickable = false;
  mitch.visibleRatio = 0;
  mitch.trace.push(`emerge:${spot.id}`);
}

function advanceRoute(
  mitch: MitchRuntime,
  definition: SceneDefinition,
  distanceBudget: number,
): void {
  let remaining = distanceBudget;
  while (remaining > 0 && mitch.routeCursor < mitch.route.length) {
    const destinationNode = definition.routeNetwork.getNode(
      mitch.route[mitch.routeCursor] as string,
    );
    const moved = moveTowards(mitch.position, destinationNode, remaining);
    remaining -= moved.travelled;
    if (!moved.reached) {
      return;
    }
    mitch.currentNodeId = destinationNode.id;
    mitch.routeCursor += 1;
  }
  if (mitch.routeCursor >= mitch.route.length) {
    if (mitch.mode === 'emerge') {
      beginPeek(mitch, spotById(definition, mitch.currentSpotId));
    } else {
      beginSpotPhase(mitch, definition);
    }
  }
}

export function createMitch(
  definition: SceneDefinition,
  seed: number,
  profile: DifficultyProfile,
): MitchRuntime {
  const initialSpot =
    definition.hideSpots.find((spot) => !spot.occluderId) ?? definition.hideSpots[0];
  if (!initialSpot) {
    throw new Error(`Scene ${definition.id} needs at least one authored Mitch hiding spot.`);
  }
  const initialNode = definition.routeNetwork.getNode(initialSpot.approachNodeId);
  const mitch: MitchRuntime = {
    mode: 'peek',
    position: { x: initialNode.x, y: initialNode.y },
    currentNodeId: initialSpot.approachNodeId,
    route: [initialSpot.approachNodeId],
    routeCursor: 1,
    currentSpotId: initialSpot.id,
    destinationSpotId: null,
    phaseElapsedMs: 0,
    phaseDurationMs: Math.max(2400, profile.peekMs),
    fullyHiddenElapsedMs: 0,
    clickable: true,
    visibleRatio: Math.max(0.65, initialSpot.revealRatio),
    profile,
    rng: createRng(deriveSeed(seed, 'mitch')),
    trace: [`peek:${initialSpot.id}`],
  };
  return mitch;
}

export function updateMitch(
  mitch: MitchRuntime,
  definition: SceneDefinition,
  deltaMs: number,
): void {
  if (mitch.mode === 'transit' || mitch.mode === 'emerge') {
    advanceRoute(mitch, definition, (mitch.profile.mitchSpeed * deltaMs) / 1000);
    return;
  }
  mitch.phaseElapsedMs += deltaMs;
  if (mitch.mode === 'hidden') {
    mitch.fullyHiddenElapsedMs = Math.min(
      mitch.phaseDurationMs,
      mitch.fullyHiddenElapsedMs + deltaMs,
    );
    if (mitch.phaseElapsedMs >= mitch.phaseDurationMs) {
      const currentSpot = spotById(definition, mitch.currentSpotId);
      beginEmerge(mitch, definition, currentSpot);
    }
    return;
  }
  if (mitch.phaseElapsedMs >= mitch.phaseDurationMs) {
    if (mitch.mode === 'peek') {
      beginDecision(mitch);
    } else {
      beginTransit(mitch, definition);
    }
  }
}

export function mitchSnapshot(mitch: MitchRuntime): Readonly<Record<string, unknown>> {
  return Object.freeze({
    mode: mitch.mode,
    position: { x: Math.round(mitch.position.x), y: Math.round(mitch.position.y) },
    currentSpotId: mitch.currentSpotId,
    destinationSpotId: mitch.destinationSpotId,
    clickable: mitch.clickable,
    visibleRatio: mitch.visibleRatio,
    trace: [...mitch.trace.slice(-8)],
  });
}
