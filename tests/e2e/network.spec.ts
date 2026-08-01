import { expect, test } from '@playwright/test';
import { catchMitch } from './scene-helpers';

test('makes no unexpected requests after the static product has loaded', async ({ page }) => {
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

  expect(postLoadRequests).toEqual([]);
  expect(errors).toEqual([]);
});
