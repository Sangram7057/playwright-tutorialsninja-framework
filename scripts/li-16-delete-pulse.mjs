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
await page.screenshot({ path: path.join(out, 'pulse-top.png') });

// Find an overflow / options trigger near the top of the article
const candidates = [
  /more/i,
  /options/i,
  /control menu/i,
  /article options/i,
  /open menu/i,
];
// Dump all buttons with aria-labels to find the right one
const btns = await page.evaluate(() =>
  [...document.querySelectorAll('button, [role="button"]')]
    .map((b, i) => ({ i, aria: b.getAttribute('aria-label') }))
    .filter((x) => x.aria),
);
console.log(
  'BUTTONS:',
  JSON.stringify(
    btns.filter((b) => /more|option|menu|delete|control/i.test(b.aria)),
    null,
    2,
  ),
);

for (const re of candidates) {
  const b = page.getByRole('button', { name: re });
  if (await b.count()) {
    try {
      await b.first().click({ timeout: 4000 });
      console.log('opened menu via', re);
      break;
    } catch {}
  }
}
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(out, 'pulse-menu.png') });

const menuItems = await page.evaluate(() =>
  [...document.querySelectorAll('[role="menuitem"], .artdeco-dropdown__content *')]
    .map((e) => (e.getAttribute('aria-label') || e.textContent || '').trim())
    .filter((t) => t && t.length < 40),
);
console.log('MENU ITEMS:', JSON.stringify([...new Set(menuItems)], null, 2));

// Try to click a Delete item
const del = page.getByText(/^Delete( article)?$/i).first();
if (await del.count()) {
  await del.click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(out, 'pulse-delete-confirm.png') });
  const confirm = page
    .locator('#artdeco-modal-outlet')
    .getByRole('button', { name: /^Delete$/i });
  if (await confirm.count()) {
    await confirm.first().click();
    console.log('confirmed delete');
    await page.waitForTimeout(6000);
  } else console.log('no confirm button');
} else {
  console.log('no Delete menu item found');
}
await page.screenshot({ path: path.join(out, 'pulse-after.png') });
console.log('final url:', page.url());
await page.waitForTimeout(1500);
await browser.close();
