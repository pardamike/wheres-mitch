import { expect, test, type Page } from '@playwright/test';
import { catchMitch } from './scene-helpers';

interface GameDebug {
  difficulty: { mitchSpeed: number } | null;
  outcome: { beatId: string | null; elapsedMs: number } | null;
}

async function startRound(page: Page, reducedMotion = false): Promise<void> {
  await page.goto('/?seed=324001&scene=washington&debug=1');
  if (reducedMotion) {
    await page.getByRole('button', { name: 'MOTION: SYSTEM' }).click();
    await expect(page.getByRole('button', { name: 'MOTION: REDUCE' })).toBeVisible();
  }
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
}

async function startCaptureBeatHistory(page: Page): Promise<void> {
  await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('#game-root');
    if (!root) {
      throw new Error('Expected game root for capture beat history.');
    }
    const history = new Set<string>();
    const recordBeat = (beat: string | undefined) => {
      if (beat) {
        history.add(beat);
      }
    };
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.attributeName === 'data-outcome-beat') {
          recordBeat(record.oldValue ?? undefined);
        }
      }
      recordBeat(root.dataset.outcomeBeat);
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-outcome-beat'],
      attributeOldValue: true,
    });
    Object.assign(window, {
      __WHERES_MITCH_CAPTURE_BEAT_HISTORY__: history,
      __WHERES_MITCH_CAPTURE_BEAT_OBSERVER__: observer,
    });
  });
}

async function captureBeatHistory(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const debugWindow = window as Window & {
      __WHERES_MITCH_CAPTURE_BEAT_HISTORY__?: Set<string>;
      __WHERES_MITCH_CAPTURE_BEAT_OBSERVER__?: MutationObserver;
    };
    debugWindow.__WHERES_MITCH_CAPTURE_BEAT_OBSERVER__?.disconnect();
    const history = [...(debugWindow.__WHERES_MITCH_CAPTURE_BEAT_HISTORY__ ?? [])];
    delete debugWindow.__WHERES_MITCH_CAPTURE_BEAT_HISTORY__;
    delete debugWindow.__WHERES_MITCH_CAPTURE_BEAT_OBSERVER__;
    return history;
  });
}

async function debug(page: Page): Promise<GameDebug> {
  return page.evaluate(() => window.__WHERES_MITCH_DEBUG__ as unknown as GameDebug);
}

test('a successful catch plays every Capitol-return beat and advances exactly one harder round', async ({
  page,
}) => {
  await startRound(page);
  const firstDifficulty = await debug(page);
  await startCaptureBeatHistory(page);
  await catchMitch(page);
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'player_capture');

  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing', {
    timeout: 8_000,
  });
  expect(await captureBeatHistory(page)).toEqual(
    expect.arrayContaining([
      'recognition',
      'tuck',
      'dispatch',
      'travel',
      'arrival',
      'stamp',
      'transition',
    ]),
  );
  await expect(page.locator('#round-number')).toHaveText('2');
  await expect(page.locator('#completed-rounds')).toHaveText('1');
  await expect(page.locator('#clicks-remaining')).toHaveText('10');
  const secondDifficulty = await debug(page);
  expect(secondDifficulty.difficulty?.mitchSpeed).toBeGreaterThan(
    firstDifficulty.difficulty?.mitchSpeed ?? 0,
  );
});

test('capture Skip appears only after the outcome is established and resolves the same round once', async ({
  page,
}) => {
  // A reduced-motion capture completes only a few hundred milliseconds after Skip is enabled,
  // which makes this a scheduler race instead of a control test. Full motion leaves the intended
  // one-second semantic Skip window available for real input.
  await startRound(page);
  await catchMitch(page);
  await expect(page.locator('#outcome-skip')).toBeHidden();
  await page.waitForFunction(() => {
    const outcome = (window.__WHERES_MITCH_DEBUG__ as unknown as GameDebug).outcome;
    return outcome?.elapsedMs !== undefined && outcome.elapsedMs >= 1000;
  });
  await expect(page.locator('#outcome-skip')).toBeVisible();
  await page.locator('#outcome-skip').click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing', {
    timeout: 4_000,
  });
  await expect(page.locator('#round-number')).toHaveText('2');
  await expect(page.locator('#completed-rounds')).toHaveText('1');
});
