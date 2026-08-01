import { expect, test } from '@playwright/test';
import {
  catchMitch,
  clickWorldPoint,
  loseRound,
  skipOutcomeTo,
  startScene,
  waitForMitchAt,
  waitForOccludedMitch,
} from './scene-helpers';

test.describe('airport concourse', () => {
  test('renders its own world, makes an occluded concourse click miss, then catches an exposed Mitch', async ({
    page,
  }) => {
    await startScene(page, 'airport', 324003, 13);
    await expect(page.locator('[data-scene-art="airport"]')).toBeAttached();
    await expect(page.locator('#airport-walkway')).toBeAttached();
    await expect(page.locator('#airport-kiosk')).toBeAttached();

    const hidden = await waitForOccludedMitch(page);
    expect(['airport-column', 'airport-seats', 'airport-kiosk', 'airport-cart']).toContain(
      hidden.currentSpotId,
    );
    await clickWorldPoint(page, hidden.position);
    await expect(page.locator('#clicks-remaining')).toHaveText('9');

    await waitForMitchAt(page, 'peek', hidden.currentSpotId);
    await catchMitch(page);
    await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'player_capture');
  });

  test('keeps the exact ten-miss escape rule in the airport', async ({ page }) => {
    await startScene(page, 'airport', 324003);
    await loseRound(page);
    await expect(page.locator('[data-cutscene-kind="escape"]')).toBeAttached();
    await skipOutcomeTo(page, 'game_over');
    await expect(page.getByRole('button', { name: 'SEARCH AGAIN' })).toBeVisible();
  });

  test('keeps the airport readable in compact landscape', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await startScene(page, 'airport', 324003);
    const box = await page.locator('#game-stage').boundingBox();
    expect(box?.width).toBeGreaterThan(350);
    expect(box?.height).toBeGreaterThan(220);
    expect((box?.width ?? 0) / (box?.height ?? 1)).toBeGreaterThan(1.58);
    expect((box?.width ?? 0) / (box?.height ?? 1)).toBeLessThan(1.62);
    await expect(page.locator('#airport-departure-board')).toBeVisible();
  });
});
