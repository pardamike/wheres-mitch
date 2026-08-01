import { expect, test } from '@playwright/test';

const fixtures = [
  { scene: 'washington', seed: 324001, art: '[data-scene-art="washington"]' },
  { scene: 'fair', seed: 324002, art: '[data-scene-art="fair"]' },
  { scene: 'airport', seed: 324003, art: '[data-scene-art="airport"]' },
] as const;

test('fixed scene fixtures have stable authored art inside the common stage at desktop and mobile', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 667, height: 375 },
  ]) {
    await page.setViewportSize(viewport);
    for (const fixture of fixtures) {
      await page.goto(`/?seed=${fixture.seed}&scene=${fixture.scene}&debug=1`);
      await page.getByRole('button', { name: 'START THE SEARCH' }).click();
      await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
      const stageBox = await page.locator('#game-stage').boundingBox();
      const artBounds = await page.locator(fixture.art).evaluate((art) => {
        const bounds = (art as SVGGElement).getBBox();
        return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
      });
      expect(stageBox).not.toBeNull();
      expect(stageBox?.width).toBeGreaterThan(viewport.width * 0.75);
      expect(stageBox?.height).toBeGreaterThan(viewport.height * 0.45);
      expect(artBounds.x).toBeLessThanOrEqual(0);
      expect(artBounds.y).toBeLessThanOrEqual(0);
      expect(artBounds.width).toBeGreaterThanOrEqual(1440);
      expect(artBounds.height).toBeGreaterThanOrEqual(900);
    }
  }
});
