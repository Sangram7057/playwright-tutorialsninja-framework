import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const editUrl = fs.readFileSync(path.join(out, 'v2-edit-url.txt'), 'utf8').trim();

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  storageState: statePath,
});
const page = await ctx.newPage();
await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

const total = await page.evaluate(() => document.body.scrollHeight);
console.log('scrollHeight', total);
let y = 0,
  i = 0;
while (y < total + 1000 && i < 16) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(700);
  await page.screenshot({
    path: path.join(out, `v2-scroll-${String(i).padStart(2, '0')}.png`),
  });
  y += 900;
  i++;
}
console.log('captured', i, 'shots');
await browser.close();
