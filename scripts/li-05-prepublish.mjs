import { chromium } from 'playwright';
import path from 'node:path';

const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const EDIT_URL = 'https://www.linkedin.com/article/edit/7477702959062081537/';

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({ viewport: null, storageState: statePath });
const page = await ctx.newPage();
await page.goto(EDIT_URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

// Top: title + cover
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1200);
await page.screenshot({ path: path.join(out, '05-top.png') });

const titleVal = await page
  .locator('textarea.article-editor-headline__textarea')
  .inputValue()
  .catch(() => '');
const hasCover = await page.evaluate(
  () =>
    !!document.querySelector(
      'img[class*="cover"], .article-editor-cover img, figure img',
    ),
);
console.log('title:', JSON.stringify(titleVal), '| hasCover:', hasCover);

// Click Next -> publish modal
await page
  .getByRole('button', { name: /^Next$/i })
  .first()
  .click();
await page.waitForTimeout(4000);
await page.screenshot({ path: path.join(out, '05-publish-modal.png') });

const modal = await page.evaluate(() => {
  const m = document.querySelector('#artdeco-modal-outlet .artdeco-modal');
  if (!m) return { hasModal: false };
  const buttons = [...m.querySelectorAll('button, [role="button"]')]
    .map((b) => (b.getAttribute('aria-label') || b.textContent || '').trim())
    .filter(Boolean);
  const heading = (m.querySelector('h1, h2, [role="heading"]') || {}).textContent?.trim();
  return { hasModal: true, heading, buttons };
});
console.log(JSON.stringify(modal, null, 2));

await page.waitForTimeout(1500);
await browser.close();
