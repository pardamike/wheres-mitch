import { defineConfig, devices } from '@playwright/test';

const fileTest = process.env.PLAYWRIGHT_FILE_TEST === '1';
const webkitSmoke = process.env.PLAYWRIGHT_WEBKIT_SMOKE === '1';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: fileTest ? 1 : undefined,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  use: {
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 1000 },
  },
  projects: [
    {
      name: 'chromium',
      testMatch:
        /(vertical-slice|occlusion|pause|performance|controls-and-copy|capture-cutscene|escape-cutscene|audio|kentucky-fair|airport|scene-deck|visual|persistence|responsive-and-motion|network|browser-smoke)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4173' },
    },
    {
      name: 'chromium-mobile',
      testMatch: /touch\.spec\.ts/,
      use: {
        ...devices['iPhone 13 landscape'],
        browserName: 'chromium',
        baseURL: 'http://127.0.0.1:4173',
      },
    },
    {
      name: 'chrome',
      testMatch: /browser-smoke\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        baseURL: 'http://127.0.0.1:4173',
      },
    },
    {
      name: 'firefox',
      testMatch: /browser-smoke\.spec\.ts/,
      use: { ...devices['Desktop Firefox'], baseURL: 'http://127.0.0.1:4173' },
    },
    ...(webkitSmoke
      ? [
          {
            name: 'webkit',
            testMatch: /browser-smoke\.spec\.ts/,
            use: { ...devices['Desktop Safari'], baseURL: 'http://127.0.0.1:4173' },
          },
        ]
      : []),
    {
      name: 'file',
      testMatch: /file-smoke\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'file-firefox',
      testMatch: /file-smoke\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    ...(webkitSmoke
      ? [
          {
            name: 'file-webkit',
            testMatch: /file-smoke\.spec\.ts/,
            use: { ...devices['Desktop Safari'] },
          },
        ]
      : []),
  ],
  webServer: fileTest
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
});
