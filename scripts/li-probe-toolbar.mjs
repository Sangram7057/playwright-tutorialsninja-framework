import { chromium } from 'playwright';
import path from 'node:path';

const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({ viewport: null, storageState: statePath });
const page = await ctx.newPage();
await page.goto('https://www.linkedin.com/article/new/', {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(8000);

const all = await page.evaluate(() => {
  return [...document.querySelectorAll('button, [role="button"]')]
    .map((b) => ({
      aria: b.getAttribute('aria-label'),
      title: b.getAttribute('title'),
      dataName: b.getAttribute('data-test-icon') || b.getAttribute('data-name'),
      cls: (b.className || '').toString().slice(0, 70),
    }))
    .filter((x) => x.aria || x.title || (x.cls && x.cls.includes('toolbar')));
});
console.log('ALL TOOLBAR-ISH:', JSON.stringify(all, null, 2));

// Open the Style dropdown and list options
try {
  await page
    .getByRole('button', { name: /^Style$/i })
    .first()
    .click();
  await page.waitForTimeout(1500);
  const styleOpts = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        '[role="menuitem"], .artdeco-dropdown__content li, .artdeco-dropdown__content button',
      ),
    ]
      .map((e) => (e.getAttribute('aria-label') || e.textContent || '').trim())
      .filter(Boolean)
      .slice(0, 30),
  );
  console.log('STYLE OPTIONS:', JSON.stringify(styleOpts, null, 2));
  await page.screenshot({ path: path.join(out, 'probe-style-dropdown.png') });
} catch (e) {
  console.log('style dropdown err:', e.message);
}

await page.waitForTimeout(1000);
await browser.close();
