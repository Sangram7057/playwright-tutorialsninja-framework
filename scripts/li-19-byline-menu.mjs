import { chromium } from 'playwright';
import path from 'node:path';
const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const PULSE =
  'https://www.linkedin.com/pulse/how-i-built-playwright-typescript-framework-claude-code-shinde-ysluf/';
const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  storageState: statePath,
});
const page = await ctx.newPage();
await page.goto(PULSE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
const trigger = page
  .locator(
    'button.artdeco-dropdown__trigger:has([data-test-icon="overflow-web-ios-small"])',
  )
  .first();
await trigger.scrollIntoViewIfNeeded();
await trigger.click();
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(out, 'byline-menu.png') });
const items = await page.evaluate(() =>
  [
    ...document.querySelectorAll(
      '.artdeco-dropdown__content--is-open *, [role="menu"] *, .artdeco-dropdown__content *',
    ),
  ]
    .map((e) => (e.getAttribute('aria-label') || e.textContent || '').trim())
    .filter((t) => t && t.length < 50),
);
console.log('BYLINE MENU:', JSON.stringify([...new Set(items)], null, 2));
await page.waitForTimeout(800);
await browser.close();
