import { expect, test, type Page } from '@playwright/test';

interface AudioDebug {
  available: boolean;
  unlocked: boolean;
  muted: boolean;
  suspended: boolean;
  cueCount: number;
}

async function audioDebug(page: Page): Promise<AudioDebug> {
  return page.evaluate(
    () => (window.__WHERES_MITCH_DEBUG__ as unknown as { audio: AudioDebug }).audio,
  );
}

test('audio remains lazy until Start and mute/pause lifecycle stays nonfatal', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/?seed=324001&debug=1');
  expect((await audioDebug(page)).unlocked).toBe(false);
  expect((await audioDebug(page)).cueCount).toBe(0);

  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  await expect
    .poll(async () => {
      const audio = await audioDebug(page);
      return audio.unlocked || !audio.available;
    })
    .toBe(true);

  await page.locator('.hud').getByRole('button', { name: 'Mute sound' }).click();
  await expect(page.locator('.hud').getByRole('button', { name: 'Unmute sound' })).toBeVisible();
  expect((await audioDebug(page)).muted).toBe(true);
  await page.locator('.hud').getByRole('button', { name: 'Pause game' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'paused');
  const pausedAudio = await audioDebug(page);
  if (pausedAudio.unlocked && pausedAudio.available) {
    await expect.poll(async () => (await audioDebug(page)).suspended).toBe(true);
  }
  await page.locator('#pause-card').getByRole('button', { name: 'RESUME' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  expect(errors).toEqual([]);
});
