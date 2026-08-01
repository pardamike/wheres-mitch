import { expect, test, type Page } from '@playwright/test';

async function startScene(page: Page, scene = 'washington'): Promise<void> {
  await page.goto(`/?seed=324001&scene=${scene}&debug=1`);
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
}

test('keeps the complete stage and 44px controls usable across release landscape viewports', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 1024, height: 768 },
    { width: 844, height: 390 },
    { width: 667, height: 375 },
  ]) {
    await page.setViewportSize(viewport);
    await startScene(page);
    const stage = page.locator('#game-stage');
    const stageBox = await stage.boundingBox();
    const footerBox = await page.locator('.game-footer').boundingBox();
    const controls = page.locator('.hud-controls .icon-button');

    expect(stageBox).not.toBeNull();
    expect(footerBox).not.toBeNull();
    expect(stageBox?.x).toBeGreaterThanOrEqual(-1);
    expect(stageBox?.y).toBeGreaterThanOrEqual(0);
    expect((stageBox?.x ?? 0) + (stageBox?.width ?? 0)).toBeLessThanOrEqual(viewport.width + 1);
    expect((stageBox?.y ?? 0) + (stageBox?.height ?? 0)).toBeLessThanOrEqual(viewport.height + 1);
    expect((stageBox?.width ?? 0) / (stageBox?.height ?? 1)).toBeGreaterThan(1.58);
    expect((stageBox?.width ?? 0) / (stageBox?.height ?? 1)).toBeLessThan(1.62);
    expect(footerBox?.y).toBeGreaterThanOrEqual((stageBox?.y ?? 0) + (stageBox?.height ?? 0));

    for (const index of await controls.all()) {
      const controlBox = await index.boundingBox();
      expect(controlBox?.width).toBeGreaterThanOrEqual(44);
      expect(controlBox?.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test('shows an actionable portrait advisory without changing the logical game stage', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startScene(page);

  await expect(page.locator('#rotate-card')).toBeVisible();
  await expect(page.locator('#rotate-card')).toContainText('Rotate your device.');
  await expect(page.locator('#game-stage')).toHaveAttribute('viewBox', '0 0 1440 900');
  const stageBox = await page.locator('#game-stage').boundingBox();
  expect(stageBox).not.toBeNull();
  expect((stageBox?.x ?? 0) + (stageBox?.width ?? 0)).toBeLessThanOrEqual(391);
  await page.getByRole('button', { name: 'CONTINUE ANYWAY' }).click();
  await expect(page.locator('#rotate-card')).toBeHidden();
  await expect(page.locator('#game-stage')).toHaveAttribute('viewBox', '0 0 1440 900');
});

test('moves focus into dialogs and returns it to the invoking control', async ({ page }) => {
  await startScene(page);
  const restart = page.locator('.hud').getByRole('button', { name: 'Restart run' });
  await restart.click();
  await expect(page.locator('#restart-card')).toBeVisible();
  await expect(page.locator('[data-action="confirm-restart"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#restart-card')).toBeHidden();
  await expect(restart).toBeFocused();

  const help = page.locator('.hud').getByRole('button', { name: 'Help and credits' });
  await help.click();
  await expect(page.locator('#credits-card')).toBeVisible();
  await expect(page.locator('#close-help')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#credits-card')).toBeHidden();
  await expect(help).toBeFocused();
});

test('honors system, reduced, and full motion while keeping Mitch movement intact', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?seed=324002&scene=fair&debug=1');
  await expect
    .poll(() => page.evaluate(() => window.__WHERES_MITCH_DEBUG__?.reducedMotion))
    .toBe(true);
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');

  const reducedWheelTransform = await page.locator('#fair-wheel-spin').getAttribute('transform');
  expect(reducedWheelTransform).toBe('rotate(0)');
  await page.waitForTimeout(350);
  await expect(page.locator('#fair-wheel-spin')).toHaveAttribute('transform', 'rotate(0)');

  const initialMitch = await page.evaluate(() => {
    const debug = window.__WHERES_MITCH_DEBUG__ as {
      mitch?: { position: { x: number; y: number } };
    };
    return debug.mitch?.position;
  });
  await page.waitForFunction(
    (initialPosition) => {
      const debug = window.__WHERES_MITCH_DEBUG__ as {
        mitch?: { position: { x: number; y: number } };
      };
      const current = debug.mitch?.position;
      return (
        Boolean(current) &&
        Boolean(initialPosition) &&
        (current?.x !== initialPosition?.x || current?.y !== initialPosition?.y)
      );
    },
    initialMitch,
    { timeout: 6_000, polling: 'raf' },
  );

  await page.locator('.hud').getByRole('button', { name: 'Pause game' }).click();
  const pauseCard = page.locator('#pause-card');
  await pauseCard.locator('[data-action="title-motion"]').click();
  await expect(pauseCard.locator('[data-action="title-motion"]')).toHaveText('MOTION: REDUCE');
  await pauseCard.locator('[data-action="title-motion"]').click();
  await expect(pauseCard.locator('[data-action="title-motion"]')).toHaveText('MOTION: FULL');
  await pauseCard.getByRole('button', { name: 'RESUME', exact: true }).click();
  await expect
    .poll(() => page.locator('#fair-wheel-spin').getAttribute('transform'))
    .not.toBe('rotate(0)');

  await page.reload();
  const title = page.locator('#title-screen');
  await expect(title.locator('[data-action="title-motion"]')).toHaveText('MOTION: FULL');
  await expect
    .poll(() => page.evaluate(() => window.__WHERES_MITCH_DEBUG__?.reducedMotion))
    .toBe(false);
  await title.locator('[data-action="title-motion"]').click();
  await expect(title.locator('[data-action="title-motion"]')).toHaveText('MOTION: SYSTEM');
  await expect
    .poll(() => page.evaluate(() => window.__WHERES_MITCH_DEBUG__?.reducedMotion))
    .toBe(true);
});

test('keeps title controls and help reachable at 200 percent zoom', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/?seed=324001&scene=washington&debug=1');
  await page.evaluate(() => {
    document.body.style.zoom = '2';
  });

  const titleHelp = page.locator('#title-screen [data-action="help"]');
  await titleHelp.scrollIntoViewIfNeeded();
  await titleHelp.click();
  await expect(page.locator('#credits-card')).toBeVisible();
  await expect(page.locator('#close-help')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#credits-card')).toBeHidden();
});
