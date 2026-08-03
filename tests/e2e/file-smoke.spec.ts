import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, test, type Page } from '@playwright/test';
import { catchMitch } from './scene-helpers';

const repositoryRoot = process.cwd();
const gameFileUrl = pathToFileURL(path.join(repositoryRoot, 'dist', 'index.html')).href;
const standaloneFilePath = path.join(repositoryRoot, 'release', 'wheres-mitch-standalone.html');
const standaloneGameFileUrl = pathToFileURL(standaloneFilePath).href;

test.beforeAll(() => {
  execFileSync(process.execPath, ['scripts/build-standalone.mjs'], {
    cwd: repositoryRoot,
    stdio: 'pipe',
  });
});

async function completeOfflineGame(page: Page, gameUrl: string, expectedHeadHref: string | RegExp) {
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

  await page.goto(`${gameUrl}?seed=324001&scene=washington&debug=1`);
  await expect(page.getByRole('heading', { name: "WHERE'S MITCH?" })).toBeVisible();
  await expect(page.locator('#title-mitch-head')).toHaveAttribute('href', expectedHeadHref);
  await page.locator('#title-screen [data-action="title-motion"]').click();
  await page.locator('#title-screen [data-action="title-motion"]').click();
  await expect(page.locator('#title-screen [data-action="title-motion"]')).toHaveText(
    'MOTION: FULL',
  );
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  await expect(page.locator('#mitch-root [data-asset="mitch-head"]')).toHaveAttribute(
    'href',
    expectedHeadHref,
  );
  await page.locator('#game-stage').click({ position: { x: 24, y: 24 } });
  await expect(page.locator('#clicks-remaining')).toHaveText('9');
  await catchMitch(page);
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
}

test('opens directly from the normal file artifact and completes catch, escape, restart, and settings without network activity', async ({
  page,
}) => {
  await completeOfflineGame(page, gameFileUrl, './assets/mitch-head.png');
});

test('opens the single self-contained HTML artifact directly without network activity', async ({
  page,
}) => {
  const standaloneHtml = readFileSync(standaloneFilePath, 'utf8');
  const faviconHref = standaloneHtml.match(
    /<link rel="icon" href="([^"]+)" type="image\/svg\+xml" \/>/,
  )?.[1];
  expect(faviconHref).toMatch(/^data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+$/);
  expect(standaloneHtml).not.toContain('./styles.css');
  expect(standaloneHtml).not.toContain('./game.js');
  expect(standaloneHtml).not.toContain('./favicon.svg');
  expect(standaloneHtml).not.toContain('./assets/mitch-head.png');

  await completeOfflineGame(page, standaloneGameFileUrl, /^data:image\/png;base64,/);
});
