import { describe, expect, it } from 'vitest';
import { difficultyForRound } from '../../src/core/difficulty';
import { getAirportDefinition } from '../../src/scenes/airport';
import { createSceneInstance, validateSceneDefinition } from '../../src/world/scene';

describe('airport concourse', () => {
  it('has a valid layered concourse with queues, seating, and luggage hides', () => {
    const airport = getAirportDefinition();
    expect(() => validateSceneDefinition(airport)).not.toThrow();
    expect(airport.title).toBe('AIRPORT CONCOURSE');
    expect(airport.behaviorAnchors.filter((anchor) => anchor.kind === 'queue')).toHaveLength(2);
    expect(airport.behaviorAnchors.filter((anchor) => anchor.kind === 'sit')).toHaveLength(2);
    expect(airport.occluders.map((occluder) => occluder.id)).toEqual(
      expect.arrayContaining(['airport-column', 'airport-kiosk', 'airport-seats', 'airport-cart']),
    );
  });

  it('opens with a fair target and keeps every authored hide connected to the gate route', () => {
    const airport = getAirportDefinition();
    const scene = createSceneInstance(airport, 324003, difficultyForRound(0));
    expect(scene.mitch.clickable).toBe(true);
    expect(scene.mitch.visibleRatio).toBeGreaterThanOrEqual(0.65);
    for (const spot of airport.hideSpots) {
      expect(airport.routeNetwork.isReachable(scene.mitch.currentNodeId, spot.approachNodeId)).toBe(
        true,
      );
    }
  });
});
