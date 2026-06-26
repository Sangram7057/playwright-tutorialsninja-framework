/**
 * Environment metadata + Allure environment file writer.
 *
 * Responsibility (SRP): expose a single, read-only snapshot of "what we ran
 * against" (env name, base URL, browser, CI flag, runtime versions) and persist
 * it for the Allure report's Environment widget.
 *
 * Why: reports are only trustworthy when they state the exact context of the run.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { env } from '@config/env.config';

/** Immutable description of the current execution context. */
export interface EnvironmentInfo {
  environment: string;
  baseUrl: string;
  browser: string;
  headless: boolean;
  ci: boolean;
  nodeVersion: string;
  platform: string;
}

/** Returns a snapshot of the current run's environment. */
export function getEnvironmentInfo(): EnvironmentInfo {
  return {
    environment: env.environment,
    baseUrl: env.baseUrl,
    browser: env.browser,
    headless: env.headless,
    ci: !!process.env.CI,
    nodeVersion: process.version,
    platform: process.platform,
  };
}

/**
 * Writes `environment.properties` into the Allure results folder so the report
 * shows the run context. Safe to call repeatedly (idempotent).
 */
export function writeAllureEnvironment(
  resultsDir = resolve(process.cwd(), 'reports', 'allure-results'),
): void {
  if (!existsSync(resultsDir)) {
    mkdirSync(resultsDir, { recursive: true });
  }

  const info = getEnvironmentInfo();
  const content = Object.entries(info)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('\n');

  writeFileSync(resolve(resultsDir, 'environment.properties'), `${content}\n`, 'utf-8');
}
