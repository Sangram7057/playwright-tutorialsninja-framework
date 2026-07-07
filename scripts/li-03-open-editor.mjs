import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const out = path.resolve('linkedin-post-assets', 'drive-shots');
fs.mkdirSync(out, { recursive: true });
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({ viewport: null, storageState: statePath });
const page = await ctx.newPage();

await page.goto('https://www.linkedin.com/article/new/', {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(9000);

await page.screenshot({ path: path.join(out, '03-editor.png'), fullPage: false });

// Discover editable regions and toolbar buttons.
const info = await page.evaluate(() => {
  const editables = [
    ...document.querySelectorAll(
      '[contenteditable="true"], textarea, input[type="text"]',
    ),
  ].map((el) => ({
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute('role'),
    aria: el.getAttribute('aria-label'),
    placeholder:
      el.getAttribute('placeholder') ||
      el.getAttribute('data-placeholder') ||
      el.getAttribute('aria-placeholder'),
    cls: (el.className || '').toString().slice(0, 80),
  }));
  const buttons = [...document.querySelectorAll('button, [role="button"]')]
    .map((b) => (b.getAttribute('aria-label') || b.textContent || '').trim())
    .filter((t) => t && t.length < 40)
    .slice(0, 60);
  return { url: location.href, title: document.title, editables, buttons };
});
console.log(JSON.stringify(info, null, 2));

await page.waitForTimeout(2000);
await browser.close();
