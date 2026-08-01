import { expect, test, type Page } from '@playwright/test';

interface GameDebug {
  outcome: { beatId: string | null; elapsedMs: number } | null;
}

async function startRound(page: Page): Promise<void> {
  await page.goto('/?seed=324001&scene=washington&debug=1');
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
}

async function loseRound(page: Page): Promise<void> {
  const stage = page.locator('#game-stage');
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await stage.click({ position: { x: 24, y: 24 } });
  }
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'mitch_escape');
}

async function waitForEscapeBeat(page: Page, beatId: string): Promise<void> {
  await page.waitForFunction((expectedBeat) => {
    const root = document.querySelector<HTMLElement>('#game-root');
    return root?.dataset.outcome === 'escape' && root.dataset.outcomeBeat === expectedBeat;
  }, beatId);
}

test('ten misses lock play and stage the complete absurd helicopter escape before game over', async ({
  page,
}) => {
  await startRound(page);
  await loseRound(page);
  await page.locator('#game-stage').click({ position: { x: 24, y: 24 } });
  await expect(page.locator('#clicks-remaining')).toHaveText('0');

  for (const beatId of [
    'lock',
    'cash',
    'approach',
    'helicopter-entry',
    'rope',
    'lift',
    'escape',
    'resolve',
  ]) {
    await waitForEscapeBeat(page, beatId);
  }
  await expect(page.locator('#escape-helicopter')).toBeAttached();
  await expect(page.locator('#elaine-cockpit')).toBeAttached();
  await expect(page.locator('[data-joint="chinese-flag-decal"]')).toBeAttached();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'game_over', {
    timeout: 9_000,
  });
  await expect(page.getByRole('button', { name: 'SEARCH AGAIN' })).toBeVisible();
  await page.getByRole('button', { name: 'SEARCH AGAIN' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  await expect(page.locator('#clicks-remaining')).toHaveText('10');
});

test('escape Skip resolves to the only game-over state after its first second', async ({
  page,
}) => {
  await startRound(page);
  await loseRound(page);
  await expect(page.locator('#outcome-skip')).toBeHidden();
  await page.waitForFunction(() => {
    const outcome = (window.__WHERES_MITCH_DEBUG__ as unknown as GameDebug).outcome;
    return outcome?.elapsedMs !== undefined && outcome.elapsedMs >= 1000;
  });
  await expect(page.locator('#outcome-skip')).toBeVisible();
  await page.locator('#outcome-skip').click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'game_over');
  await expect(page.locator('#result-rounds')).toHaveText('0');
});
