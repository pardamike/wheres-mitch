import { expect, test, type Page } from '@playwright/test';

async function startSeededRound(page: Page): Promise<void> {
  await page.goto('/?seed=324001&scene=washington&debug=1');
  await expect(page.getByRole('heading', { name: "WHERE'S MITCH?" })).toBeVisible();
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
}

test('publishes clear fictional framing without copied-franchise or factual-claim copy', async ({
  page,
}) => {
  await page.goto('/?seed=324001&scene=washington');
  const title = page.locator('#title-screen');
  await expect(title.getByText('Ten clicks. One extremely evasive turtle.')).toBeVisible();
  await expect(title.locator('.disclaimer')).toContainText(
    'absurd work of fictional political satire',
  );
  await expect(title.locator('.disclaimer')).toContainText('exaggerated and invented');
  await expect(title.locator('.privacy-note')).toContainText(
    'No accounts. No tracking. No network',
  );

  const publicCopy = (await page.locator('body').innerText()).toLowerCase();
  for (const prohibitedTerm of ['waldo', 'bribery', 'allegation', 'evidence', 'corruption']) {
    expect(publicCopy).not.toContain(prohibitedTerm);
  }
});

test('HUD controls, confirmation, credits, and shortcuts never consume a search attempt', async ({
  page,
}) => {
  await startSeededRound(page);
  const root = page.locator('#game-root');
  const restart = page.locator('.hud').getByRole('button', { name: 'Restart run' });

  await restart.focus();
  await page.keyboard.press('r');
  await expect(page.locator('#restart-card')).toBeHidden();

  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press('r');
  await expect(page.locator('#restart-card')).toBeVisible();
  await page.locator('#game-stage').click({ position: { x: 24, y: 24 } });
  await expect(page.locator('#clicks-remaining')).toHaveText('10');
  await page.keyboard.press('Escape');
  await expect(page.locator('#restart-card')).toBeHidden();

  await page.keyboard.press('m');
  await expect(page.locator('.hud').getByRole('button', { name: 'Unmute sound' })).toBeVisible();
  await page.keyboard.press('m');
  await expect(page.locator('.hud').getByRole('button', { name: 'Mute sound' })).toBeVisible();

  await page.keyboard.press('Space');
  await expect(root).toHaveAttribute('data-mode', 'paused');
  await page.keyboard.press('Space');
  await expect(root).toHaveAttribute('data-mode', 'playing');

  await page.locator('.hud').getByRole('button', { name: 'Help and credits' }).click();
  await expect(page.locator('#credits-card')).toBeVisible();
  await expect(page.locator('#credits-card .disclaimer')).toContainText(
    'fictional political satire',
  );
  await expect(page.locator('#credits-card')).toContainText(
    'Space pauses, M toggles sound, R opens restart',
  );
  await page.keyboard.press('Escape');
  await expect(page.locator('#credits-card')).toBeHidden();
  await expect(page.locator('#clicks-remaining')).toHaveText('10');
});
