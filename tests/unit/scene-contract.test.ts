import { describe, expect, it } from 'vitest';
import { sceneDefinitions } from '../../src/scenes/registry';
import { PathNetwork } from '../../src/world/path-network';
import {
  behaviorKinds,
  validateSceneDefinition,
  type SceneDefinition,
} from '../../src/world/scene';

describe('three-scene contract', () => {
  it('validates every registered scene with connected routes and full behavior coverage', () => {
    expect(Object.keys(sceneDefinitions).sort()).toEqual(['airport', 'fair', 'washington']);
    for (const definition of Object.values(sceneDefinitions)) {
      expect(() => validateSceneDefinition(definition)).not.toThrow();
      expect(definition.routeNetwork.nodes.length).toBeGreaterThanOrEqual(16);
      expect(definition.hideSpots.length).toBeGreaterThanOrEqual(5);
      expect(definition.viewBox).toEqual({ width: 1440, height: 900 });
      for (const behavior of behaviorKinds) {
        expect(definition.behaviorAnchors.some((anchor) => anchor.kind === behavior)).toBe(true);
      }
      for (const node of definition.routeNetwork.nodes) {
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.x).toBeLessThanOrEqual(definition.viewBox.width);
        expect(node.y).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeLessThanOrEqual(definition.viewBox.height);
      }
    }
  });

  it('rejects disconnected route graphs before a scene can render', () => {
    const washington = sceneDefinitions.washington;
    const invalid: SceneDefinition = {
      ...washington,
      routeNetwork: new PathNetwork(
        [
          { id: 'one', x: 100, y: 100, lane: 0, depthLane: 'back' },
          { id: 'two', x: 200, y: 100, lane: 0, depthLane: 'back' },
        ],
        [],
      ),
    };

    expect(() => validateSceneDefinition(invalid)).toThrow('disconnected');
  });

  it('keeps every destination and escape landmark inside the logical stage', () => {
    for (const definition of Object.values(sceneDefinitions)) {
      for (const landmark of Object.values(definition.cutsceneLandmarks)) {
        expect(landmark.x).toBeGreaterThanOrEqual(0);
        expect(landmark.x).toBeLessThanOrEqual(definition.viewBox.width);
        expect(landmark.y).toBeGreaterThanOrEqual(0);
        expect(landmark.y).toBeLessThanOrEqual(definition.viewBox.height);
      }
    }
  });
});
