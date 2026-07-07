import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const editUrl = fs.readFileSync(path.join(out, 'v3-edit-url.txt'), 'utf8').trim();
const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({ viewport: null, storageState: statePath });
const page = await ctx.newPage();
await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
// Click Update (top-right)
await page
  .getByRole('button', { name: /^Update$/i })
  .first()
  .click();
await page.waitForTimeout(4000);
await page.screenshot({ path: path.join(out, 'update-modal.png') });
// If a modal with a confirm appears (Update/Publish/Save)
const modal = page.locator('#artdeco-modal-outlet');
let done = false;
for (const name of [/^Update$/i, /^Publish$/i, /^Save$/i, /^Done$/i]) {
  const b = modal.getByRole('button', { name });
  if (await b.count()) {
    try {
      await b.first().click({ timeout: 4000 });
      console.log('clicked modal', name);
      done = true;
      break;
    } catch {}
  }
}
console.log('modal confirm clicked:', done);
await page.waitForTimeout(8000);
await page.screenshot({ path: path.join(out, 'update-done.png') });
console.log('final url:', page.url());
await page.waitForTimeout(1500);
await browser.close();
