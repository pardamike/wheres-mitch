import { expect, test } from '@playwright/test';

test('completes both outcomes without post-load requests or uncaught errors', async ({ page }) => {
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
