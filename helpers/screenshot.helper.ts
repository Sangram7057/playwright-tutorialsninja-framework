/**
 * Screenshot capture + report attachment.
 *
 * Responsibility (SRP): capture screenshots consistently, save them to a known
 * location, and attach them to the active test report (HTML + Allure) so
 * failures are always visually documented.
 *
 * Note: Playwright already auto-captures screenshots on failure (configured in
 * playwright.config.ts). This helper is for *explicit* captures inside a flow
 * (e.g. an evidence shot after a key step).
 */
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Page, TestInfo } from '@playwright/test';
import { createLogger } from '@utils/logger';
import { fileSafeTimestamp } from '@utils/date.helper';

const log = createLogger('Screenshot');
const SCREENSHOT_DIR = resolve(process.cwd(), 'reports', 'screenshots');

/** Ensures the screenshots directory exists. */
function ensureDir(): void {
  if (!existsSync(SCREENSHOT_DIR)) {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

/**
 * Captures a full-page screenshot, writes it to `reports/screenshots`, and —
 * when a `testInfo` is supplied — attaches it to the report.
 *
 * @returns the absolute path of the saved screenshot file.
 */
export async function captureScreenshot(
  page: Page,
  name: string,
  testInfo?: TestInfo,
): Promise<string> {
  ensureDir();

  const safeName = name.replace(/[^a-z0-9-_]/gi, '_');
  const fileName = `${safeName}_${fileSafeTimestamp()}.png`;
  const filePath = resolve(SCREENSHOT_DIR, fileName);

  const buffer = await page.screenshot({ path: filePath, fullPage: true });
  log.info(`Screenshot captured: ${filePath}`);

  if (testInfo) {
    await testInfo.attach(name, { body: buffer, contentType: 'image/png' });
  }

  return filePath;
}
