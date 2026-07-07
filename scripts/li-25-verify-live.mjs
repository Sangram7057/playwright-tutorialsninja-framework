import { chromium } from 'playwright';
import path from 'node:path';
const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const PULSE =
  'https://www.linkedin.com/pulse/how-i-built-playwright-typescript-framework-claude-code-shinde-zxbgf/';
const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  storageState: statePath,
});
const page = await ctx.newPage();
await page.goto(PULSE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
const imgs = await page.evaluate(
  () => [...document.querySelectorAll('article img, .reader-article-content img')].length,
);
const hasReport = await page.evaluate(() =>
  /ALL TESTS PASSED|Test Execution Report/i.test(document.body.innerText) ? true : false,
);
console.log('content images:', imgs, '| report text present:', hasReport);
// scroll to the report
const el = await page.$('text=The full suite runs 18 test cases');
if (el) {
  await el.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 1700));
  await page.waitForTimeout(800);
}
await page.screenshot({ path: path.join(out, 'live-report-check.png') });
await browser.close();
