import { expect, test, type Page } from '@playwright/test';

interface DebugDeck {
  sceneId: string | null;
  sceneDeck: { bag: string[]; previousSceneId: string | null };
}

async function currentDebug(page: Page): Promise<DebugDeck> {
  return page.evaluate(() => window.__WHERES_MITCH_DEBUG__ as unknown as DebugDeck);
}

test('normal play consumes a deterministic no-repeat scene deck', async ({ page }) => {
  await page.goto('/?seed=324099&debug=1');
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');

  const scenes: string[] = [];
  for (let round = 0; round < 3; round += 1) {
    const debug = await currentDebug(page);
    scenes.push(debug.sceneId ?? '');
    await page.locator('#mitch-root').click({ force: true });
    await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'player_capture');
    await expect(page.locator('#outcome-skip')).toBeVisible({ timeout: 3_500 });
    await page.locator('#outcome-skip').click();
    await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing', {
      timeout: 4_000,
    });
  }

  expect(new Set(scenes)).toEqual(new Set(['washington', 'fair', 'airport']));
  expect(scenes[0]).not.toBe(scenes[1]);
  expect(scenes[1]).not.toBe(scenes[2]);
});

test('invalid scene input falls back to a bundled normal scene', async ({ page }) => {
  await page.goto('/?seed=324099&scene=not-a-scene&debug=1');
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  const debug = await currentDebug(page);
  expect(['washington', 'fair', 'airport']).toContain(debug.sceneId);
  expect(debug.sceneDeck.previousSceneId).toBe(debug.sceneId);
});
