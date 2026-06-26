/**
 * Centralised, type-safe environment configuration.
 *
 * Responsibility (SRP): load the correct `.env` file once and expose a single
 * immutable, validated configuration object to the rest of the framework.
 *
 * Why this exists:
 *  - No other module should ever read `process.env` directly. Reading env vars
 *    in many places leads to typos, untyped values and duplicated defaults.
 *  - Tests/pages consume `env` and get autocomplete + compile-time safety.
 */
import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Supported deployment targets. Extend here when new environments are added. */
export type TestEnvironment = 'qa' | 'staging' | 'prod';

/** Supported browser engines for local/CI execution. */
export type SupportedBrowser = 'chromium' | 'firefox' | 'webkit';

/**
 * Loads the environment file that matches `TEST_ENV` (e.g. `.env.qa`),
 * falling back to the base `.env`. The first existing file wins.
 */
function loadEnvironmentFile(): void {
  const targetEnv = process.env.TEST_ENV ?? 'qa';
  const candidates = [`.env.${targetEnv}`, '.env'];

  for (const fileName of candidates) {
    const fullPath = resolve(process.cwd(), fileName);
    if (existsSync(fullPath)) {
      loadDotenv({ path: fullPath, override: false });
    }
  }
}

/** Reads a required string variable, throwing a clear error when missing. */
function requireString(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: "${key}".`);
  }
  return value;
}

/** Reads an optional integer with a safe default. */
function readInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/** Reads an optional boolean (`true`/`1` => true). */
function readBool(key: string, fallback: boolean): boolean {
  const raw = process.env[key];
  if (raw === undefined) {
    return fallback;
  }
  return raw === 'true' || raw === '1';
}

// Load variables before the config object is constructed.
loadEnvironmentFile();

/**
 * The single, frozen configuration object for the whole framework.
 * Consume it via `import { env } from '@config/env.config'`.
 */
export const env = Object.freeze({
  /** Active environment name. */
  environment: (process.env.TEST_ENV ?? 'qa') as TestEnvironment,

  /** Application under test base URL. */
  baseUrl: requireString('BASE_URL', 'https://tutorialsninja.com/demo/'),

  /** Default browser when no Playwright project is specified. */
  browser: (process.env.BROWSER ?? 'chromium') as SupportedBrowser,

  /** Run without a visible UI when true. */
  headless: readBool('HEADLESS', true),

  /** Default action/navigation timeouts in milliseconds. */
  actionTimeout: readInt('ACTION_TIMEOUT', 15_000),
  navigationTimeout: readInt('NAVIGATION_TIMEOUT', 30_000),
  expectTimeout: readInt('EXPECT_TIMEOUT', 10_000),

  /** Number of retries for flaky tests (CI typically overrides this). */
  retries: readInt('RETRIES', 0),

  /**
   * Enables the full guest order-placement E2E. Off by default because the
   * public demo blocks checkout; set true against a guest-checkout-enabled
   * instance (see docs/local-opencart.md).
   */
  runCheckoutE2E: readBool('RUN_CHECKOUT_E2E', false),

  /** Parallel worker count; empty => Playwright auto-detects. */
  workers: process.env.WORKERS ? readInt('WORKERS', 1) : undefined,

  /** Winston log level: error | warn | info | http | verbose | debug. */
  logLevel: process.env.LOG_LEVEL ?? 'info',

  /** Seeded standard-user credentials (never hardcode in tests). */
  standardUser: {
    email: process.env.STANDARD_USER_EMAIL ?? '',
    password: process.env.STANDARD_USER_PASSWORD ?? '',
  },
});

export type AppConfig = typeof env;
