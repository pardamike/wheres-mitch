import { describe, expect, it } from 'vitest';
import { getWashingtonDefinition } from '../../src/scenes/washington';
import { moveTowards, PathNetwork } from '../../src/world/path-network';
import { validateSceneDefinition, type SceneDefinition } from '../../src/world/scene';

describe('authored path networks', () => {
  it('validates the connected Washington actor and hiding graph', () => {
    const definition = getWashingtonDefinition();

    expect(() => validateSceneDefinition(definition)).not.toThrow();
    for (const spot of definition.hideSpots) {
      expect(definition.routeNetwork.isReachable(spot.approachNodeId, 'mid-cross')).toBe(true);
      if (spot.peekNodeId) {
        expect(definition.routeNetwork.isReachable(spot.approachNodeId, spot.peekNodeId)).toBe(
          true,
        );
      }
    }
  });

  it('rejects duplicate, out-of-bounds, and missing-edge route data with focused errors', () => {
    expect(
      () =>
        new PathNetwork(
          [
            { id: 'a', x: 0, y: 0, lane: 0, depthLane: 'back' },
            { id: 'a', x: 10, y: 10, lane: 0, depthLane: 'back' },
          ],
          [],
        ),
    ).toThrow('unique IDs');
    expect(
      () => new PathNetwork([{ id: 'a', x: 2000, y: 0, lane: 0, depthLane: 'back' }], []),
    ).toThrow('invalid stage coordinates');
    expect(
      () =>
        new PathNetwork(
          [{ id: 'a', x: 0, y: 0, lane: 0, depthLane: 'back' }],
          [{ from: 'a', to: 'missing' }],
        ),
    ).toThrow('unknown node');
  });

  it('rejects an authored hide spot that cannot reach another spot', () => {
    const disconnected = new PathNetwork(
      [
        { id: 'a', x: 100, y: 100, lane: 0, depthLane: 'back' },
        { id: 'b', x: 300, y: 100, lane: 0, depthLane: 'back' },
      ],
      [],
    );
    const definition: SceneDefinition = {
      id: 'washington',
      title: 'fixture',
      routeNetwork: disconnected,
      behaviorAnchors: [
        { id: 'commute', kind: 'commute', nodeId: 'a' },
        { id: 'queue', kind: 'queue', nodeId: 'a' },
        { id: 'conversation', kind: 'conversation', nodeId: 'a' },
        { id: 'sit', kind: 'sit', nodeId: 'a' },
        { id: 'interact', kind: 'interact', nodeId: 'a' },
        { id: 'observe', kind: 'observe', nodeId: 'a' },
      ],
      hideSpots: [
        { id: 'one', position: { x: 100, y: 100 }, approachNodeId: 'a', revealRatio: 1, weight: 1 },
        { id: 'two', position: { x: 300, y: 100 }, approachNodeId: 'b', revealRatio: 1, weight: 1 },
      ],
      occluders: [],
    };

    expect(() => validateSceneDefinition(definition)).toThrow('cannot reach another');
  });

  it('clamps interpolation exactly at segment endpoints', () => {
    const position = { x: 10, y: 10 };
    expect(moveTowards(position, { x: 20, y: 10 }, 3)).toEqual({ reached: false, travelled: 3 });
    expect(position).toEqual({ x: 13, y: 10 });
    expect(moveTowards(position, { x: 20, y: 10 }, 30)).toEqual({ reached: true, travelled: 7 });
    expect(position).toEqual({ x: 20, y: 10 });
  });
});
