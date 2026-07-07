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
await page.waitForTimeout(7000);
// Click "View post"
await page
  .getByText(/^View post$/i)
  .first()
  .click();
await page.waitForTimeout(7000);
console.log('post url:', page.url());
await page.screenshot({ path: path.join(out, 'post-view.png') });
// Open the post control menu (three-dot at top-right of the post)
const trigger = page
  .locator(
    'button[aria-label*="control menu" i], button[aria-label*="more actions" i], button[aria-label*="open control" i]',
  )
  .first();
if (await trigger.count()) {
  await trigger.click();
  console.log('opened post control menu');
} else {
  // fallback: overflow icon within a feed update
  const ov = page
    .locator(
      '.feed-shared-update-v2 button:has([data-test-icon*="overflow"]), button:has([data-test-icon="overflow-web-ios-medium"])',
    )
    .first();
  if (await ov.count()) {
    await ov.click();
    console.log('opened via overflow icon');
  }
}
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(out, 'post-menu.png') });
const items = await page.evaluate(() =>
  [...document.querySelectorAll('[role="menuitem"], .artdeco-dropdown__content *')]
    .map((e) => (e.getAttribute('aria-label') || e.textContent || '').trim())
    .filter((t) => t && t.length < 60),
);
console.log('POST MENU:', JSON.stringify([...new Set(items)], null, 2));
// Click Delete
const del = page
  .getByRole('button', { name: /Delete (post|article)/i })
  .or(page.getByText(/^Delete (post|article)$/i))
  .first();
if (await del.count()) {
  await del.click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(out, 'post-delete-confirm.png') });
  const confirm = page
    .locator('#artdeco-modal-outlet')
    .getByRole('button', { name: /^Delete$/i });
  if (await confirm.count()) {
    await confirm.first().click();
    console.log('CONFIRMED');
    await page.waitForTimeout(6000);
  } else
    console.log(
      'confirm btns:',
      JSON.stringify(
        await page
          .locator('#artdeco-modal-outlet button')
          .allInnerTexts()
          .catch(() => []),
      ),
    );
} else console.log('no Delete item');
await page.screenshot({ path: path.join(out, 'post-after.png') });
console.log('final:', page.url());
await page.waitForTimeout(1500);
await browser.close();
