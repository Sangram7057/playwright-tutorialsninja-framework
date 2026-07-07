import { chromium } from 'playwright';
import path from 'node:path';
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
const all = await page.evaluate(() =>
  [...document.querySelectorAll('button')]
    .map((b, i) => {
      const ic = b.querySelector('[data-test-icon]');
      const r = b.getBoundingClientRect();
      return {
        i,
        aria: b.getAttribute('aria-label'),
        icon: ic ? ic.getAttribute('data-test-icon') : null,
        cls: (b.className || '').toString().slice(0, 40),
        x: Math.round(r.x),
        y: Math.round(r.y),
      };
    })
    .filter((b) => b.y > 120 && b.y < 760 && (b.icon || b.aria)),
);
console.log(JSON.stringify(all, null, 2));
await browser.close();
