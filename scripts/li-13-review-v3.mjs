import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const editUrl = fs.readFileSync(path.join(out, 'v3-edit-url.txt'), 'utf8').trim();

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  storageState: statePath,
});
const page = await ctx.newPage();
await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

const rp = page
  .locator('div.ProseMirror p', { hasText: 'The full suite runs 18 test cases' })
  .first();
await rp.scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(out, 'v3-result-1.png') });
await page.evaluate(() => window.scrollBy(0, 850));
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(out, 'v3-result-2.png') });
console.log('figures:', await page.locator('div.ProseMirror figure').count());
await browser.close();
