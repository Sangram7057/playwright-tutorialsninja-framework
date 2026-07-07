import { chromium } from 'playwright';
import path from 'node:path';
const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const OLD_EDIT = 'https://www.linkedin.com/article/edit/7477709378649911296/';

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  storageState: statePath,
});
const page = await ctx.newPage();
await page.goto(OLD_EDIT, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

// Open Manage menu
await page
  .getByRole('button', { name: /Manage/i })
  .first()
  .click();
await page.waitForTimeout(1500);
const items = await page.evaluate(() =>
  [
    ...document.querySelectorAll(
      '[role="menuitem"], .artdeco-dropdown__content li, .artdeco-dropdown__content button, .artdeco-dropdown__content a',
    ),
  ]
    .map((e) => (e.getAttribute('aria-label') || e.textContent || '').trim())
    .filter(Boolean),
);
console.log('MANAGE ITEMS:', JSON.stringify(items, null, 2));
await page.screenshot({ path: path.join(out, 'old-manage-menu.png') });

// Click Delete
const del = page.getByRole('menuitem', { name: /Delete/i });
let clickedDelete = false;
if (await del.count()) {
  await del.first().click();
  clickedDelete = true;
} else {
  const del2 = page
    .locator('.artdeco-dropdown__content')
    .getByText(/Delete/i)
    .first();
  if (await del2.count()) {
    await del2.click();
    clickedDelete = true;
  }
}
console.log('clicked delete menu item:', clickedDelete);
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(out, 'old-delete-confirm.png') });

// Confirm in modal
const modal = page.locator('#artdeco-modal-outlet');
const confirm = modal.getByRole('button', { name: /^Delete$/i });
if (await confirm.count()) {
  await confirm.first().click();
  console.log('confirmed delete');
  await page.waitForTimeout(6000);
} else {
  console.log(
    'no confirm Delete button found; buttons:',
    JSON.stringify(
      await modal
        .locator('button')
        .allInnerTexts()
        .catch(() => []),
    ),
  );
}
await page.screenshot({ path: path.join(out, 'old-deleted.png') });
console.log('final url:', page.url());
await page.waitForTimeout(1500);
await browser.close();
