import { describe, expect, it } from 'vitest';
import { difficultyForRound } from '../../src/core/difficulty';
import { getWashingtonDefinition } from '../../src/scenes/washington';
import { createCrowdActors, reactToMiss, updateCrowdActors } from '../../src/world/behaviors';

function actorSignature(seed: number) {
  const definition = getWashingtonDefinition();
  const actors = createCrowdActors(definition, seed, difficultyForRound(0));
  for (let frame = 0; frame < 180; frame += 1) {
    updateCrowdActors(actors, definition, 50);
  }
  return actors.map((actor) => ({
    id: actor.id,
    routine: actor.routine,
    pose: actor.pose,
    node: actor.currentNodeId,
    target: actor.targetNodeId,
    x: Math.round(actor.position.x * 100),
    y: Math.round(actor.position.y * 100),
    lane: actor.depthLane,
  }));
}

function actorSnapshot(actors: ReturnType<typeof createCrowdActors>) {
  return actors.map((actor) => ({
    id: actor.id,
    routine: actor.routine,
    pose: actor.pose,
    x: actor.position.x,
    y: actor.position.y,
    reactionRemainingMs: actor.reactionRemainingMs,
  }));
}

describe('seeded crowd routines', () => {
  it('assigns every authored behavior family and reproduces the same decisions', () => {
    const definition = getWashingtonDefinition();
    const actors = createCrowdActors(definition, 324001, difficultyForRound(0));
    const routines = new Set(actors.map((actor) => actor.routine));

    expect(routines).toEqual(
      new Set(['commute', 'queue', 'conversation', 'sit', 'interact', 'observe']),
    );
    expect(actorSignature(324001)).toEqual(actorSignature(324001));
    expect(actorSignature(324001)).not.toEqual(actorSignature(324002));
  });

  it('only follows authored graph segments and clamps a completed walk at its destination', () => {
    const definition = getWashingtonDefinition();
    const [actor] = createCrowdActors(definition, 11, difficultyForRound(0));
    if (!actor) {
      throw new Error('Expected a Washington crowd actor.');
    }
    for (let attempt = 0; attempt < 8 && actor.route.length === 1; attempt += 1) {
      actor.routineElapsedMs = actor.routineDurationMs;
      updateCrowdActors([actor], definition, 1);
    }
    expect(actor.route.length).toBeGreaterThan(1);
    expect(actor.route[0]).toBe(actor.currentNodeId);
    for (let index = 1; index < actor.route.length; index += 1) {
      expect(definition.routeNetwork.neighbors(actor.route[index - 1] as string)).toContain(
        actor.route[index],
      );
    }

    updateCrowdActors([actor], definition, 30_000);
    const destination = definition.routeNetwork.getNode(actor.targetNodeId);
    expect(actor.position).toEqual({ x: destination.x, y: destination.y });
    expect(actor.currentNodeId).toBe(destination.id);
    expect(actor.routeCursor).toBe(actor.route.length);
  });

  it('reacts locally to a miss and resumes the preserved routine without advancing on a zero delta', () => {
    const definition = getWashingtonDefinition();
    const actors = createCrowdActors(definition, 41, difficultyForRound(0));
    const actor = actors[0];
    if (!actor) {
      throw new Error('Expected a Washington crowd actor.');
    }
    const before = actorSnapshot(actors);
    updateCrowdActors(actors, definition, 0);
    expect(actorSnapshot(actors)).toEqual(before);

    const routine = actor.routine;
    reactToMiss(actors, actor.position.x, actor.position.y);
    expect(actor.pose).toBe('react');
    expect(actor.previousRoutine).toBe(routine);
    updateCrowdActors(actors, definition, 500);
    expect(actor.routine).toBe(routine);
    expect(actor.previousRoutine).toBeNull();
    expect(actor.pose).not.toBe('react');
  });
});
