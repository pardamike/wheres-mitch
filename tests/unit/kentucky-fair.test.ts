import { describe, expect, it } from 'vitest';
import { difficultyForRound } from '../../src/core/difficulty';
import { getKentuckyFairDefinition } from '../../src/scenes/kentucky-fair';
import { createSceneInstance, validateSceneDefinition } from '../../src/world/scene';

describe('Kentucky county fair', () => {
  it('has a valid, connected fairground with purpose-built hiding and activity anchors', () => {
    const fair = getKentuckyFairDefinition();
    expect(() => validateSceneDefinition(fair)).not.toThrow();
    expect(fair.title).toBe('KENTUCKY COUNTY FAIR');
    expect(fair.behaviorAnchors.filter((anchor) => anchor.kind === 'interact')).toHaveLength(2);
    expect(fair.behaviorAnchors.filter((anchor) => anchor.kind === 'observe')).toHaveLength(3);
    expect(fair.occluders.map((occluder) => occluder.id)).toEqual(
      expect.arrayContaining(['fair-booth', 'fair-hay', 'fair-prize-wall']),
    );
  });

  it('opens with an exposed Mitch and preserves every authored hide route', () => {
    const fair = getKentuckyFairDefinition();
    const scene = createSceneInstance(fair, 324002, difficultyForRound(0));
    expect(scene.mitch.clickable).toBe(true);
    expect(scene.mitch.visibleRatio).toBeGreaterThanOrEqual(0.65);
    for (const spot of fair.hideSpots) {
      expect(fair.routeNetwork.isReachable(scene.mitch.currentNodeId, spot.approachNodeId)).toBe(
        true,
      );
    }
  });
});
