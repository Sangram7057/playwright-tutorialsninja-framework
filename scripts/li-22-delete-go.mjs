import { chromium } from 'playwright';
import path from 'node:path';
const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const ACT = 'https://www.linkedin.com/feed/update/urn:li:ugcPost:7477710133087703041/';
const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  storageState: statePath,
});
const page = await ctx.newPage();
await page.goto(ACT, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);
const ctrl = page.locator('button[aria-label*="control menu" i]').first();
await ctrl.click();
await page.waitForTimeout(1500);
const del = page.getByText(/Delete article and post/i).first();
await del.click();
console.log('clicked Delete article and post');
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(out, 'final-confirm.png') });
const modal = page.locator('#artdeco-modal-outlet');
const confirm = modal.getByRole('button', { name: /^Delete$/i });
if (await confirm.count()) {
  await confirm.first().click();
  console.log('CONFIRMED');
  await page.waitForTimeout(6000);
} else
  console.log(
    'confirm btns:',
    JSON.stringify(
      await modal
        .locator('button')
        .allInnerTexts()
        .catch(() => []),
    ),
  );
await page.screenshot({ path: path.join(out, 'final-after.png') });
console.log('final url:', page.url());
await page.waitForTimeout(1500);
await browser.close();
