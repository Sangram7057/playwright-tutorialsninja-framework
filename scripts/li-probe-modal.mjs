import { chromium } from 'playwright';
import path from 'node:path';

const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const cover = path.resolve('linkedin-post-assets', 'card1.png');

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({ viewport: null, storageState: statePath });
const page = await ctx.newPage();
await page.goto('https://www.linkedin.com/article/new/', {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(8000);

const [chooser] = await Promise.all([
  page.waitForEvent('filechooser', { timeout: 15000 }),
  page.getByRole('button', { name: /Upload from computer/i }).click(),
]);
await chooser.setFiles(cover);
await page.waitForTimeout(6000);
await page.screenshot({ path: path.join(out, 'probe-modal.png') });

const modalButtons = await page.evaluate(() => {
  const modal = document.querySelector('#artdeco-modal-outlet');
  if (!modal) return { hasModal: false, buttons: [] };
  const buttons = [...modal.querySelectorAll('button, [role="button"]')]
    .map((b) => (b.getAttribute('aria-label') || b.textContent || '').trim())
    .filter(Boolean);
  return { hasModal: true, buttons };
});
console.log(JSON.stringify(modalButtons, null, 2));

await page.waitForTimeout(1000);
await browser.close();
