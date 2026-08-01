import { expect, test, type Page } from '@playwright/test';

interface FrameMetrics {
  samples: number[];
  durationMs: number;
  actorCount: number;
  actorNodes: number;
  targetNodes: number;
  viewport: { width: number; height: number; devicePixelRatio: number };
}

function percentile(samples: readonly number[], quantile: number): number {
  const sorted = [...samples].sort((first, second) => first - second);
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * quantile));
  return sorted[index] as number;
}

async function measureFrames(page: Page, durationMs = 30_000): Promise<FrameMetrics> {
  return page.evaluate(async (sampleDurationMs) => {
    const debug = window.__WHERES_MITCH_DEBUG__ as { actorCount: number };
    const actorNodes = document.querySelectorAll('[data-actor]').length;
    const targetNodes = document.querySelectorAll('[data-game-target="mitch"]').length;
    const samples: number[] = [];
    let previous = performance.now();
    const startedAt = previous;
    const end = previous + sampleDurationMs;

    await new Promise<void>((resolve) => {
      const sample = (timestamp: number) => {
        samples.push(timestamp - previous);
        previous = timestamp;
        if (timestamp >= end) {
          resolve();
          return;
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });

    return {
      samples,
      durationMs: performance.now() - startedAt,
      actorCount: debug.actorCount,
      actorNodes,
      targetNodes,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
    };
  }, durationMs);
}

async function startMaximumCrowdRound(page: Page): Promise<void> {
  await page.goto('/?seed=324001&round=13&debug=1');
  await page.getByRole('button', { name: 'START THE SEARCH' }).click();
  await expect(page.locator('#game-root')).toHaveAttribute('data-mode', 'playing');
  await expect
    .poll(() => page.evaluate(() => window.__WHERES_MITCH_DEBUG__?.actorCount ?? 0))
    .toBe(96);
}

test('96-actor production SVG world sustains a practical desktop frame cadence', async ({
  page,
}) => {
  test.setTimeout(50_000);
  await startMaximumCrowdRound(page);
  await page.waitForTimeout(1000);
  const beforeCount = await page.locator('[data-actor]').count();
  const metrics = await measureFrames(page);
  const afterCount = await page.locator('[data-actor]').count();
  const median = percentile(metrics.samples, 0.5);
  const p95 = percentile(metrics.samples, 0.95);
  const worst = Math.max(...metrics.samples);
  const longFrames = metrics.samples.filter((sample) => sample > 50).length;

  console.info(
    `96-actor profile: ${metrics.samples.length} frames in ${metrics.durationMs.toFixed(0)}ms; ` +
      `p50 ${median.toFixed(2)}ms; p95 ${p95.toFixed(2)}ms; worst ${worst.toFixed(2)}ms; ` +
      `long frames ${longFrames}; ${metrics.viewport.width}x${metrics.viewport.height} @${metrics.viewport.devicePixelRatio}x.`,
  );

  expect(metrics.actorCount).toBe(96);
  expect(metrics.actorNodes).toBe(96);
  expect(metrics.targetNodes).toBe(2);
  expect(afterCount).toBe(beforeCount);
  expect(metrics.durationMs).toBeGreaterThanOrEqual(29_000);
  expect(median).toBeLessThanOrEqual(34);
  expect(p95).toBeLessThanOrEqual(80);
  expect(longFrames).toBeLessThan(Math.max(6, Math.ceil(metrics.samples.length * 0.02)));
});

test('96-actor compact landscape keeps the mobile advisory floor', async ({ page }) => {
  test.setTimeout(25_000);
  await page.setViewportSize({ width: 844, height: 390 });
  await startMaximumCrowdRound(page);
  await page.waitForTimeout(1000);
  const metrics = await measureFrames(page, 10_000);
  const median = percentile(metrics.samples, 0.5);
  const p95 = percentile(metrics.samples, 0.95);
  const longFrames = metrics.samples.filter((sample) => sample > 50).length;

  expect(metrics.actorCount).toBe(96);
  expect(metrics.actorNodes).toBe(96);
  expect(metrics.durationMs).toBeGreaterThanOrEqual(9_000);
  expect(median).toBeLessThanOrEqual(34);
  expect(p95).toBeLessThanOrEqual(80);
  expect(longFrames).toBeLessThan(Math.max(4, Math.ceil(metrics.samples.length * 0.03)));
});
