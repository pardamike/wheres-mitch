import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, test } from '@playwright/test';

const repositoryRoot = process.cwd();
const gameFileUrl = pathToFileURL(path.join(repositoryRoot, 'dist', 'index.html')).href;

test.beforeAll(() => {
  execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: repositoryRoot, stdio: 'pipe' });
});

test('opens directly from file and completes a real catch without network activity', async ({
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

  await page.goto(`${gameFileUrl}?seed=324001&debug=1`);
  await expect(page.getByRole('heading', { name: "WHERE'S MITCH?" })).toBeVisible();
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  await page.locator('#mitch-root').click({ force: true });
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'player_capture');

  expect(errors).toEqual([]);
  expect(remoteRequests).toEqual([]);
});
