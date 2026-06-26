/**
 * Playwright runtime configuration.
 *
 * All tunable values come from `@config/env.config` (which itself reads the
 * correct `.env` file). This keeps the config declarative and environment
 * driven — nothing here is hardcoded per-machine.
 */
import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env.config';

const IS_CI = !!process.env.CI;

export default defineConfig({
  // Where the test specs live.
  testDir: './tests',

  // Global per-test timeout and assertion timeout.
  timeout: 60_000,
  expect: {
    timeout: env.expectTimeout,
  },

  // Run tests inside files in parallel.
  fullyParallel: true,

  // Fail the CI build if a `test.only` is committed by accident.
  forbidOnly: IS_CI,

  // Retry strategy: CI retries twice, locals honour the env value.
  retries: IS_CI ? 2 : env.retries,

  // Worker count: env override locally, capped on CI for stability.
  workers: IS_CI ? 2 : env.workers,

  // Reporters: console summary + HTML + Allure + JUnit (for CI integrations).
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['allure-playwright', { resultsDir: 'reports/allure-results', detail: true }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
  ],

  // Raw artifacts (screenshots/videos/traces) for failed tests.
  outputDir: 'reports/test-artifacts',

  // Defaults applied to every test/context.
  use: {
    baseURL: env.baseUrl,
    headless: env.headless,

    actionTimeout: env.actionTimeout,
    navigationTimeout: env.navigationTimeout,

    // Capture rich diagnostics only when something fails (cheap + useful).
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Stable, deterministic locale/timezone for repeatable runs.
    locale: 'en-US',
    timezoneId: 'UTC',
    viewport: { width: 1366, height: 768 },
    ignoreHTTPSErrors: true,
  },

  // Cross-browser matrix.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
