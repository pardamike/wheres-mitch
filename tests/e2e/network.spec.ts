import { expect, test } from '@playwright/test';

test('makes no network requests after the static product has loaded', async ({ page }) => {
  const errors: string[] = [];
  const postLoadRequests: string[] = [];
  let productLoaded = false;

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (productLoaded && !request.url().endsWith('/favicon.svg')) {
      postLoadRequests.push(request.url());
    }
  });

  await page.goto('/?seed=324001&scene=washington&debug=1');
  await page.waitForLoadState('networkidle');
  productLoaded = true;

  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  await page.locator('#mitch-root').click({ force: true });
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'player_capture');

  expect(postLoadRequests).toEqual([]);
  expect(errors).toEqual([]);
});
