import { expect, test, type Page } from '@playwright/test';

interface MitchDebugSnapshot {
  mode: string;
  currentSpotId: string;
  position: { x: number; y: number };
}

async function startWashingtonOcclusionRound(page: Page): Promise<void> {
  await page.goto('/?seed=324001&round=13&scene=washington&debug=1');
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  await expect(page.locator('#clicks-remaining')).toHaveText('10');
}

async function waitForMitchAt(
  page: Page,
  mode: string,
  spotId: string,
): Promise<MitchDebugSnapshot> {
  await page.waitForFunction(
    ({ expectedMode, expectedSpotId }) => {
      const debug = window.__WHERES_MITCH_DEBUG__ as { mitch?: MitchDebugSnapshot } | undefined;
      return debug?.mitch?.mode === expectedMode && debug.mitch.currentSpotId === expectedSpotId;
    },
    { expectedMode: mode, expectedSpotId: spotId },
    { timeout: 20_000, polling: 'raf' },
  );
  return page.evaluate(() => {
    const debug = window.__WHERES_MITCH_DEBUG__ as { mitch: MitchDebugSnapshot };
    return debug.mitch;
  });
}

async function clickWorldPoint(page: Page, point: { x: number; y: number }): Promise<void> {
  const screenPoint = await page.locator('#game-stage').evaluate((stage, worldPoint) => {
    const matrix = (stage as SVGSVGElement).getScreenCTM();
    if (!matrix) {
      throw new Error('Expected a rendered SVG transform matrix.');
    }
    const transformed = new DOMPoint(worldPoint.x, worldPoint.y).matrixTransform(matrix);
    return { x: transformed.x, y: transformed.y };
  }, point);
  await page.mouse.click(screenPoint.x, screenPoint.y);
}

test('an opaque shelter blocks a covered Mitch click, then the exposed peek catches him', async ({
  page,
}) => {
  await startWashingtonOcclusionRound(page);

  const hidden = await waitForMitchAt(page, 'hidden', 'shelter-panel');
  await clickWorldPoint(page, hidden.position);
  await expect(page.locator('#clicks-remaining')).toHaveText('9');
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');

  await waitForMitchAt(page, 'peek', 'shelter-panel');
  // On fast rounds Mitch can leave a peek between a debug snapshot and a screen-coordinate click.
  // Let Playwright resolve the live visible hit target for this successful-pointer assertion.
  await page.locator('#mitch-root').click({ force: true });
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'player_capture');
});
