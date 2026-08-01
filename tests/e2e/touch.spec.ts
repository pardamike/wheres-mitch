import { expect, test } from '@playwright/test';

test('records misses and a catch from touch input in mobile landscape', async ({ page }) => {
  await page.goto('/?seed=324001&scene=washington&debug=1');
  await page.getByRole('button', { name: 'START THE SEARCH' }).tap();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  await expect(page.locator('#rotate-card')).toBeHidden();

  await page.locator('#game-stage').tap({ position: { x: 24, y: 24 } });
  await expect(page.locator('#clicks-remaining')).toHaveText('9');
  await page.locator('#mitch-root').tap({ force: true });
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'player_capture');
});
