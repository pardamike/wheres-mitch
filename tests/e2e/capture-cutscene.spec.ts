import { expect, test, type Page } from '@playwright/test';

interface GameDebug {
  difficulty: { mitchSpeed: number } | null;
  outcome: { beatId: string | null; elapsedMs: number } | null;
}

async function startRound(page: Page, reducedMotion = false): Promise<void> {
  await page.goto('/?seed=324001&scene=washington&debug=1');
  if (reducedMotion) {
    await page.getByRole('button', { name: 'MOTION: SYSTEM' }).click();
    await expect(page.getByRole('button', { name: 'MOTION: REDUCE' })).toBeVisible();
  }
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
}

async function waitForCaptureBeat(page: Page, beatId: string): Promise<void> {
  await page.waitForFunction((expectedBeat) => {
    const root = document.querySelector<HTMLElement>('#game-root');
    return root?.dataset.outcome === 'capture' && root.dataset.outcomeBeat === expectedBeat;
  }, beatId);
}

async function debug(page: Page): Promise<GameDebug> {
  return page.evaluate(() => window.__WHERES_MITCH_DEBUG__ as unknown as GameDebug);
}

test('a successful catch plays every Capitol-return beat and advances exactly one harder round', async ({
  page,
}) => {
  await startRound(page);
  const firstDifficulty = await debug(page);
  await page.locator('#mitch-root').click({ force: true });
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'player_capture');

  for (const beatId of [
    'recognition',
    'tuck',
    'dispatch',
    'travel',
    'arrival',
    'stamp',
    'transition',
  ]) {
    await waitForCaptureBeat(page, beatId);
  }
  await expect(page.locator('[data-cutscene-kind="capture"]')).toHaveAttribute(
    'data-cutscene-beat',
    'transition',
  );
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing', {
    timeout: 8_000,
  });
  await expect(page.locator('#round-number')).toHaveText('2');
  await expect(page.locator('#completed-rounds')).toHaveText('1');
  await expect(page.locator('#clicks-remaining')).toHaveText('10');
  const secondDifficulty = await debug(page);
  expect(secondDifficulty.difficulty?.mitchSpeed).toBeGreaterThan(
    firstDifficulty.difficulty?.mitchSpeed ?? 0,
  );
});

test('capture Skip appears only after the outcome is established and resolves the same round once', async ({
  page,
}) => {
  // A reduced-motion capture completes only a few hundred milliseconds after Skip is enabled,
  // which makes this a scheduler race instead of a control test. Full motion leaves the intended
  // one-second semantic Skip window available for real input.
  await startRound(page);
  await page.locator('#mitch-root').click({ force: true });
  await expect(page.locator('#outcome-skip')).toBeHidden();
  await page.waitForFunction(() => {
    const outcome = (window.__WHERES_MITCH_DEBUG__ as unknown as GameDebug).outcome;
    return outcome?.elapsedMs !== undefined && outcome.elapsedMs >= 1000;
  });
  await expect(page.locator('#outcome-skip')).toBeVisible();
  await page.locator('#outcome-skip').click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing', {
    timeout: 4_000,
  });
  await expect(page.locator('#round-number')).toHaveText('2');
  await expect(page.locator('#completed-rounds')).toHaveText('1');
});
