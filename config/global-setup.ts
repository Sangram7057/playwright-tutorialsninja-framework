/**
 * Playwright global setup — runs once before the whole test session.
 *
 * Responsibility (SRP): seed the Allure results folder with run context so the
 * generated report is self-describing:
 *  - `environment.properties` — what we ran against (env, baseURL, browser…)
 *  - `categories.json`        — how to bucket failures (product vs. infra)
 *
 * Keeping this in global setup means the metadata is always fresh and never
 * hand-maintained.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeAllureEnvironment } from '@utils/environment';
import { createLogger } from '@utils/logger';

const log = createLogger('GlobalSetup');
const ALLURE_RESULTS = resolve(process.cwd(), 'reports', 'allure-results');

/** Allure failure-classification buckets shown in the report's Categories tab. */
const ALLURE_CATEGORIES = [
  {
    name: 'Product defects',
    matchedStatuses: ['failed'],
  },
  {
    name: 'Test/infrastructure issues (broken)',
    matchedStatuses: ['broken'],
  },
  {
    name: 'Ignored / pending',
    matchedStatuses: ['skipped'],
  },
];

async function globalSetup(): Promise<void> {
  if (!existsSync(ALLURE_RESULTS)) {
    mkdirSync(ALLURE_RESULTS, { recursive: true });
  }

  writeAllureEnvironment(ALLURE_RESULTS);
  writeFileSync(
    resolve(ALLURE_RESULTS, 'categories.json'),
    JSON.stringify(ALLURE_CATEGORIES, null, 2),
    'utf-8',
  );

  log.info('Allure environment + categories metadata written.');
}

export default globalSetup;
