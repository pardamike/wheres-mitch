import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, test } from '@playwright/test';

const repositoryRoot = process.cwd();
const gameFileUrl = pathToFileURL(path.join(repositoryRoot, 'dist', 'index.html')).href;

test.beforeAll(() => {
  execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: repositoryRoot, stdio: 'pipe' });
  execFileSync(process.execPath, ['scripts/verify-dist.mjs'], {
    cwd: repositoryRoot,
    stdio: 'pipe',
  });
});

test('opens directly from file and completes catch, escape, restart, and settings without network activity', async ({
  page,
}) => {
  const errors: string[] = [];
  const remoteRequests: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (/^(?:https?|wss?):/i.test(request.url())) {
      remoteRequests.push(request.url());
    }
  });

  await page.goto(`${gameFileUrl}?seed=324001&scene=washington&debug=1`);
  await expect(page.getByRole('heading', { name: "WHERE'S MITCH?" })).toBeVisible();
  await page.locator('#title-screen [data-action="title-motion"]').click();
  await page.locator('#title-screen [data-action="title-motion"]').click();
  await expect(page.locator('#title-screen [data-action="title-motion"]')).toHaveText(
    'MOTION: FULL',
  );
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  await page.locator('#game-stage').click({ position: { x: 24, y: 24 } });
  await expect(page.locator('#clicks-remaining')).toHaveText('9');
  await page.locator('#mitch-root').click({ force: true });
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'player_capture');
  await expect(page.locator('#outcome-skip')).toBeVisible({ timeout: 3_000 });
  await page.locator('#outcome-skip').click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  await expect(page.locator('#round-number')).toHaveText('2');

  const stage = page.locator('#game-stage');
  for (let remaining = 9; remaining >= 0; remaining -= 1) {
    await stage.click({ position: { x: 24, y: 24 } });
    await expect(page.locator('#clicks-remaining')).toHaveText(String(remaining));
  }
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'mitch_escape');
  await expect(page.locator('#outcome-skip')).toBeVisible({ timeout: 3_000 });
  await page.locator('#outcome-skip').click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'game_over');
  await page.getByRole('button', { name: 'SEARCH AGAIN' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');

  expect(errors).toEqual([]);
  expect(remoteRequests).toEqual([]);
});
