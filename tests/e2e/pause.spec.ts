import { expect, test, type Page } from '@playwright/test';

interface GameDebugSnapshot {
  mode: string;
  clicksRemaining: number;
  mitch: { mode: string; currentSpotId: string; position: { x: number; y: number } } | null;
  clock: { elapsedMs: number; paused: boolean; reasons: string[] };
}

async function debugSnapshot(page: Page): Promise<GameDebugSnapshot> {
  return page.evaluate(() => window.__WHERES_MITCH_DEBUG__ as unknown as GameDebugSnapshot);
}

async function startRound(page: Page): Promise<void> {
  await page.goto('/?seed=324001&scene=washington&debug=1');
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
}

async function setDocumentVisibility(page: Page, hidden: boolean): Promise<void> {
  await page.evaluate((nextHidden) => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: nextHidden });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: nextHidden ? 'hidden' : 'visible',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
}

test('manual pause freezes the world and ignores stage clicks until resume', async ({ page }) => {
  await startRound(page);
  await page.waitForTimeout(180);

  await page.locator('.hud').getByRole('button', { name: 'Pause game' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'paused');
  await expect(page.locator('#pause-card')).toBeVisible();
  const frozen = await debugSnapshot(page);
  expect(frozen.clock.paused).toBe(true);
  expect(frozen.clock.reasons).toContain('manual');

  await page.locator('#game-stage').click({ position: { x: 20, y: 20 } });
  await page.waitForTimeout(260);
  const afterWait = await debugSnapshot(page);
  expect(afterWait.clicksRemaining).toBe(frozen.clicksRemaining);
  expect(afterWait.clock.elapsedMs).toBe(frozen.clock.elapsedMs);
  expect(afterWait.mitch).toEqual(frozen.mitch);

  await page.locator('#pause-card').getByRole('button', { name: 'RESUME' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  await page.waitForTimeout(80);
  const resumed = await debugSnapshot(page);
  expect(resumed.clock.elapsedMs).toBeGreaterThan(frozen.clock.elapsedMs);
});

test('visibility suspension preserves a manual pause instead of auto-resuming it', async ({
  page,
}) => {
  await startRound(page);
  await page.locator('.hud').getByRole('button', { name: 'Pause game' }).click();
  await setDocumentVisibility(page, true);
  await setDocumentVisibility(page, false);
  await page.waitForTimeout(100);

  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'paused');
  const snapshot = await debugSnapshot(page);
  expect(snapshot.clock.reasons).toContain('manual');
  expect(snapshot.clock.paused).toBe(true);
});

test('visibility return freezes briefly behind the ready-set-find countdown', async ({ page }) => {
  await startRound(page);
  await setDocumentVisibility(page, true);
  await setDocumentVisibility(page, false);
  await expect(page.locator('#visibility-card')).toBeVisible();
  await expect(page.locator('#visibility-card')).toContainText('READY');
  const frozen = await debugSnapshot(page);
  expect(frozen.clock.reasons).toContain('visibility-countdown');

  await page.waitForTimeout(260);
  const duringCountdown = await debugSnapshot(page);
  expect(duringCountdown.clock.elapsedMs).toBe(frozen.clock.elapsedMs);
  await expect(page.locator('#visibility-card')).toBeHidden({ timeout: 3000 });
  await page.waitForTimeout(80);
  const resumed = await debugSnapshot(page);
  expect(resumed.clock.paused).toBe(false);
  expect(resumed.clock.elapsedMs).toBeGreaterThan(frozen.clock.elapsedMs);
});
