import { expect, test, type Page } from '@playwright/test';
import { catchMitch, loseRound, skipOutcomeTo } from './scene-helpers';

const recordsStorageKey = 'wheres-mitch:records:v1';

async function startSeededRound(page: Page): Promise<void> {
  await page.goto('/?seed=324001&scene=washington&debug=1');
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
}

async function completeCatch(page: Page): Promise<void> {
  await catchMitch(page);
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'player_capture');
  await page.waitForFunction(
    () => {
      const mode = document.querySelector('#game-root')?.getAttribute('data-mode');
      const skip = document.querySelector<HTMLButtonElement>('#outcome-skip');
      return mode !== 'player_capture' || (skip !== null && !skip.hidden);
    },
    undefined,
    { timeout: 3_000, polling: 'raf' },
  );
  await page.evaluate(() => {
    if (document.querySelector('#game-root')?.getAttribute('data-mode') === 'player_capture') {
      document.querySelector<HTMLButtonElement>('#outcome-skip')?.click();
    }
  });
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing', {
    timeout: 3_000,
  });
}

test('persists only documented records and settings, then resets them with confirmation', async ({
  page,
}) => {
  await page.goto('/?seed=324001&scene=washington&debug=1');
  const title = page.locator('#title-screen');
  await title.locator('[data-action="title-sound"]').click();
  await title.locator('[data-action="title-motion"]').click();
  await expect(title.locator('[data-action="title-sound"]')).toHaveText('SOUND: OFF');
  await expect(title.locator('[data-action="title-motion"]')).toHaveText('MOTION: REDUCE');

  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  await completeCatch(page);

  const stored = await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return { keys: Object.keys(window.localStorage), value: raw ? JSON.parse(raw) : null };
  }, recordsStorageKey);
  expect(stored.keys).toEqual([recordsStorageKey]);
  expect(stored.value).toMatchObject({
    version: 1,
    bestRounds: 1,
    lifetimeCatches: 1,
    soundEnabled: false,
    reducedMotionOverride: 'reduce',
  });
  expect(stored.value.fastestFindMs).toEqual(expect.any(Number));

  await page.reload();
  await expect(title.locator('[data-action="title-sound"]')).toHaveText('SOUND: OFF');
  await expect(title.locator('[data-action="title-motion"]')).toHaveText('MOTION: REDUCE');
  await title.getByRole('button', { name: 'HELP & RECORDS' }).click();
  await expect(page.locator('#records-best')).toHaveText('1');
  await expect(page.locator('#records-fastest')).toHaveText(/\d+\.\ds/);
  await expect(page.locator('#records-catches')).toHaveText('1');

  const reset = page.locator('[data-action="reset-records"]');
  await reset.click();
  await expect(page.locator('#reset-records-card')).toBeVisible();
  await expect(page.locator('[data-action="confirm-reset-records"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#reset-records-card')).toBeHidden();
  await expect(reset).toBeFocused();

  await reset.click();
  await page.locator('[data-action="confirm-reset-records"]').click();
  await expect(page.locator('#records-best')).toHaveText('—');
  await expect(page.locator('#records-fastest')).toHaveText('—');
  await expect(page.locator('#records-catches')).toHaveText('0');
  await expect
    .poll(() => page.evaluate((key) => window.localStorage.getItem(key), recordsStorageKey))
    .toBeNull();
});

test('rejects a corrupt records value and starts a safe playable default session', async ({
  page,
}) => {
  await page.goto('/?seed=324001&scene=washington&debug=1');
  await page.evaluate((key) => window.localStorage.setItem(key, '{not json'), recordsStorageKey);
  await page.reload();

  const title = page.locator('#title-screen');
  await expect(title.locator('[data-action="title-sound"]')).toHaveText('SOUND: ON');
  await expect(title.locator('[data-action="title-motion"]')).toHaveText('MOTION: SYSTEM');
  await startSeededRound(page);
  await expect(page.locator('#clicks-remaining')).toHaveText('10');
});

test('continues a complete catch-and-escape loop when local storage throws', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        throw new DOMException('Blocked by browser policy', 'SecurityError');
      },
    });
  });

  await startSeededRound(page);
  await expect
    .poll(() => page.evaluate(() => window.__WHERES_MITCH_DEBUG__?.storageAvailable))
    .toBe(false);
  await completeCatch(page);
  await loseRound(page);
  await skipOutcomeTo(page, 'game_over');
  await page.getByRole('button', { name: 'HELP & CREDITS' }).click();
  await expect(page.locator('#records-storage-status')).toHaveText(
    'This session only — local storage is unavailable.',
  );
  await expect(page.locator('#records-best')).toHaveText('1');
  expect(errors).toEqual([]);
});
