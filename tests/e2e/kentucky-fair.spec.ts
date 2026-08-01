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

test.describe('Kentucky county fair', () => {
  test('renders its own world, makes an occluded fair click miss, then catches an exposed Mitch', async ({
    page,
  }) => {
    await startScene(page, 'fair', 324002, 13);
    await expect(page.locator('[data-scene-art="fair"]')).toBeAttached();
    await expect(page.locator('#fair-ferris-wheel')).toBeAttached();
    await expect(page.locator('#fair-booth')).toBeAttached();

    const hidden = await waitForOccludedMitch(page);
    expect(['fair-prize-wall', 'fair-booth', 'fair-hay', 'fair-fence']).toContain(
      hidden.currentSpotId,
    );
    await clickWorldPoint(page, hidden.position);
    await expect(page.locator('#clicks-remaining')).toHaveText('9');

    await waitForMitchAt(page, 'peek', hidden.currentSpotId);
    await catchMitch(page);
    await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'player_capture');
  });

  test('keeps the exact ten-miss escape rule in the fair', async ({ page }) => {
    await startScene(page, 'fair', 324002);
    await loseRound(page);
    await expect(page.locator('[data-cutscene-kind="escape"]')).toBeAttached();
    await skipOutcomeTo(page, 'game_over');
    await expect(page.getByRole('button', { name: 'SEARCH AGAIN' })).toBeVisible();
  });

  test('keeps the fair readable in compact landscape', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await startScene(page, 'fair', 324002);
    const box = await page.locator('#game-stage').boundingBox();
    expect(box?.width).toBeGreaterThan(350);
    expect(box?.height).toBeGreaterThan(220);
    expect((box?.width ?? 0) / (box?.height ?? 1)).toBeGreaterThan(1.58);
    expect((box?.width ?? 0) / (box?.height ?? 1)).toBeLessThan(1.62);
    await expect(page.locator('#fair-ferris-wheel')).toBeVisible();
  });
});
