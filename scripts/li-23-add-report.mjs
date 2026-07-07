import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const editUrl = fs.readFileSync(path.join(out, 'v3-edit-url.txt'), 'utf8').trim();
const REPORT = path.resolve('linkedin-post-assets', 'pdf-report-full.png');

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  storageState: statePath,
});
const page = await ctx.newPage();
const imgBtn = page.locator('button:has([data-test-icon="image-medium"])').first();
async function closeModal() {
  for (let s = 0; s < 6; s++) {
    const open = await page.evaluate(
      () => !!document.querySelector('#artdeco-modal-outlet .artdeco-modal'),
    );
    if (!open) return true;
    let clicked = false;
    for (const name of [/^Next$/i, /^Done$/i, /^Save$/i, /^Apply$/i, /^Insert$/i]) {
      const b = page.locator('#artdeco-modal-outlet').getByRole('button', { name });
      if (await b.count()) {
        try {
          await b.first().click({ timeout: 4000 });
          clicked = true;
          break;
        } catch {}
      }
    }
    if (!clicked) return false;
    await page.waitForTimeout(2500);
  }
  return false;
}

await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

// Anchor: just before the Troubleshooting header (which sits right after the Allure figures)
const tHead = page.locator('div.ProseMirror p', { hasText: 'Troubleshooting' }).first();
await tHead.scrollIntoViewIfNeeded();
await tHead.click();
await page.keyboard.press('Home');
await page.keyboard.press('Enter'); // empty paragraph above troubleshooting
await page.keyboard.press('ArrowUp'); // move into the empty paragraph
await page.waitForTimeout(400);

// Insert the report image
const [chooser] = await Promise.all([
  page.waitForEvent('filechooser', { timeout: 12000 }),
  imgBtn.click(),
]);
await chooser.setFiles(REPORT);
await page.waitForTimeout(4000);
await closeModal();
await page.waitForTimeout(2000);

await page.waitForTimeout(7000); // autosave
console.log('figures now:', await page.locator('div.ProseMirror figure').count());

// Screenshot the result/report/troubleshooting region
const rp = page
  .locator('div.ProseMirror p', { hasText: 'The full suite runs 18 test cases' })
  .first();
await rp.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(out, 'addrep-1.png') });
await page.evaluate(() => window.scrollBy(0, 850));
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, 'addrep-2.png') });
await page.evaluate(() => window.scrollBy(0, 850));
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, 'addrep-3.png') });
await page.waitForTimeout(1500);
await browser.close();
