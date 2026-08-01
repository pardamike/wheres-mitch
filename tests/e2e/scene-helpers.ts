import { expect, type Page } from '@playwright/test';
import type { SceneId } from '../../src/core/types';

export interface MitchDebugSnapshot {
  mode: string;
  currentSpotId: string;
  position: { x: number; y: number };
}

export async function startScene(
  page: Page,
  scene: SceneId,
  seed: number,
  round = 1,
): Promise<void> {
  await page.goto(`/?seed=${seed}&round=${round}&scene=${scene}&debug=1`);
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  await expect(page.locator('#game-root')).toHaveAttribute('data-scene', scene);
  await expect(page.locator('#clicks-remaining')).toHaveText('10');
}

export async function waitForMitchAt(
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

export async function waitForOccludedMitch(page: Page): Promise<MitchDebugSnapshot> {
  await page.waitForFunction(
    () => {
      const debug = window.__WHERES_MITCH_DEBUG__ as { mitch?: MitchDebugSnapshot } | undefined;
      return debug?.mitch?.mode === 'hidden' && Boolean(debug.mitch.currentSpotId);
    },
    undefined,
    { timeout: 20_000, polling: 'raf' },
  );
  return page.evaluate(() => {
    const debug = window.__WHERES_MITCH_DEBUG__ as { mitch: MitchDebugSnapshot };
    return debug.mitch;
  });
}

export async function clickWorldPoint(page: Page, point: { x: number; y: number }): Promise<void> {
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

export async function loseRound(page: Page): Promise<void> {
  const stage = page.locator('#game-stage');
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await stage.click({ position: { x: 24, y: 24 } });
  }
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'mitch_escape');
}

export async function skipOutcomeTo(
  page: Page,
  expectedMode: 'playing' | 'game_over',
): Promise<void> {
  await expect(page.locator('#outcome-skip')).toBeVisible({ timeout: 3_500 });
  await page.locator('#outcome-skip').click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', expectedMode, {
    timeout: 4_000,
  });
}
