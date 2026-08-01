import { expect, test, type Page } from '@playwright/test';

async function startSeededRound(page: Page) {
  await page.goto('/?seed=324001&scene=washington&debug=1');
  await expect(page.getByRole('heading', { name: "WHERE'S MITCH?" })).toBeVisible();
  await expect(page.getByText('Ten clicks. One extremely evasive turtle.')).toBeVisible();
  await expect(page.locator('#title-screen .disclaimer')).toContainText(
    'fictional political satire',
  );
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
}

async function missStageTenTimes(page: Page) {
  const stage = page.locator('#game-stage');
  for (let remaining = 9; remaining >= 0; remaining -= 1) {
    await stage.click({ position: { x: 24, y: 24 } });
    await expect(page.locator('#clicks-remaining')).toHaveText(String(remaining));
  }
}

test.describe('Washington vertical slice', () => {
  test('starts, catches Mitch, and resets a new round through real target input', async ({
    page,
  }) => {
    await startSeededRound(page);

    await expect(page.locator('#round-number')).toHaveText('1');
    await expect(page.locator('#clicks-remaining')).toHaveText('10');
    await expect(page.locator('#completed-rounds')).toHaveText('0');
    await expect(page.locator('#mitch-root')).toBeVisible();

    await page.locator('#mitch-root').click({ force: true });
    await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'player_capture');
    await expect(page.locator('#clicks-remaining')).toHaveText('10');
    await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing', {
      timeout: 8_000,
    });
    await expect(page.locator('#round-number')).toHaveText('2');
    await expect(page.locator('#completed-rounds')).toHaveText('1');
  });

  test('counts exactly ten misses, locks the escape, and restarts cleanly', async ({ page }) => {
    await startSeededRound(page);
    await missStageTenTimes(page);

    await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'mitch_escape');
    await page.locator('#game-stage').click({ position: { x: 24, y: 24 } });
    await expect(page.locator('#clicks-remaining')).toHaveText('0');
    await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'game_over', {
      timeout: 9_000,
    });
    await expect(page.getByRole('heading', { name: 'MITCH GOT AWAY' })).toBeVisible();

    await page.getByRole('button', { name: 'SEARCH AGAIN' }).click();
    await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
    await expect(page.locator('#round-number')).toHaveText('1');
    await expect(page.locator('#clicks-remaining')).toHaveText('10');
    await expect(page.locator('#completed-rounds')).toHaveText('0');
  });

  test('keeps HUD controls outside the attempt boundary', async ({ page }) => {
    await startSeededRound(page);

    await page.locator('.hud').getByRole('button', { name: 'Pause game' }).click();
    await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'paused');
    await expect(page.locator('#clicks-remaining')).toHaveText('10');
    await page.locator('.hud').getByRole('button', { name: 'Resume game' }).click();
    await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
    await page.locator('.hud').getByRole('button', { name: 'Mute sound' }).click();
    await expect(page.locator('#clicks-remaining')).toHaveText('10');
  });
});
