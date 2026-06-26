/**
 * Browser/context/session-level helper operations.
 *
 * Responsibility (SRP): wrap common browser-context and session housekeeping
 * (cookies, storage, browser identity) so tests/pages don't reimplement these.
 *
 * Page *interactions* (click/fill/wait) deliberately live in BasePage — this
 * file is strictly about the browser/context/session boundary.
 */
import type { BrowserContext, Page } from '@playwright/test';
import { createLogger } from '@utils/logger';

const log = createLogger('BrowserHelper');

/** Returns the underlying browser engine name (chromium | firefox | webkit). */
export function getBrowserName(page: Page): string {
  return page.context().browser()?.browserType().name() ?? 'unknown';
}

/** Clears all cookies for the given context (e.g. to force a logged-out state). */
export async function clearCookies(context: BrowserContext): Promise<void> {
  await context.clearCookies();
  log.debug('Browser cookies cleared.');
}

/** Clears localStorage and sessionStorage for the active page. */
export async function clearWebStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  log.debug('localStorage and sessionStorage cleared.');
}

/**
 * Fully resets the session (cookies + web storage). Useful between independent
 * scenarios that share a context.
 */
export async function resetSession(page: Page): Promise<void> {
  await clearCookies(page.context());
  await clearWebStorage(page);
  log.info('Session reset (cookies + web storage cleared).');
}
