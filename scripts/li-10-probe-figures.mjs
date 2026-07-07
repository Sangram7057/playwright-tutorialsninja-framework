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

const figs = page.locator('div.ProseMirror figure');
const n = await figs.count();
console.log('figures:', n);

// Scroll first figure into view and hover to reveal controls
await figs.first().scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await figs.first().hover();
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(out, 'fig-probe.png') });

const btns = await figs.first().evaluate((f) =>
  [...f.querySelectorAll('button')].map((b) => ({
    aria: b.getAttribute('aria-label'),
    icon: (b.querySelector('[data-test-icon]') || {}).getAttribute?.('data-test-icon'),
  })),
);
console.log('FIRST FIGURE BUTTONS:', JSON.stringify(btns, null, 2));

await page.waitForTimeout(1000);
await browser.close();
