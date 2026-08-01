import { expect, test } from '@playwright/test';
import { catchMitch } from './scene-helpers';

test('completes both outcomes without unexpected post-load requests or uncaught errors', async ({
  page,
}) => {
  const errors: string[] = [];
  const postLoadRequests: string[] = [];
  let productLoaded = false;
  let productOrigin = '';

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    const url = new URL(request.url());
    const isExpectedStaticAsset =
      url.origin === productOrigin &&
      (url.pathname === '/favicon.svg' || url.pathname === '/assets/mitch-head.png');
    if (productLoaded && !isExpectedStaticAsset) {
      postLoadRequests.push(request.url());
    }
  });

  await page.goto('/?seed=324001&scene=washington&debug=1');
  await page.waitForLoadState('networkidle');
  productOrigin = new URL(page.url()).origin;
  productLoaded = true;
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');

  await catchMitch(page);
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'player_capture');
  await expect(page.locator('#outcome-skip')).toBeVisible({ timeout: 3_000 });
  await page.locator('#outcome-skip').click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  await expect(page.locator('#round-number')).toHaveText('2');

  const stage = page.locator('#game-stage');
  for (let remaining = 9; remaining >= 0; remaining -= 1) {
    await stage.click({ position: { x: 24, y: 24 } });
    await expect(page.locator('#clicks-remaining')).toHaveText(String(remaining));
  }
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'mitch_escape');
  await expect(page.locator('#outcome-skip')).toBeVisible({ timeout: 3_000 });
  await page.locator('#outcome-skip').click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'game_over');

  expect(postLoadRequests).toEqual([]);
  expect(errors).toEqual([]);
});
