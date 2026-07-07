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
// Find the View post link href
const href = await page.evaluate(() => {
  const a = [...document.querySelectorAll('a')].find((a) =>
    /view post/i.test(a.textContent || ''),
  );
  return a ? a.href : null;
});
console.log('view post href:', href);
if (!href) {
  await browser.close();
  process.exit(1);
}
await page.goto(href, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);
await page.screenshot({ path: path.join(out, 'activity-view.png') });
// Open the post's control menu (three-dot) — within the main update
const ctrl = page.locator('button[aria-label*="control menu" i]').first();
if (await ctrl.count()) {
  await ctrl.click();
  console.log('clicked control menu');
} else {
  const ov = page
    .locator('button:has([data-test-icon="overflow-web-ios-medium"])')
    .first();
  if (await ov.count()) {
    await ov.click();
    console.log('clicked overflow-medium');
  } else console.log('no control menu found');
}
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(out, 'activity-menu.png') });
const items = await page.evaluate(() =>
  [
    ...document.querySelectorAll(
      '[role="menuitem"], .artdeco-dropdown__content *, [role="menu"] *',
    ),
  ]
    .map((e) => (e.getAttribute('aria-label') || e.textContent || '').trim())
    .filter((t) => t && t.length < 60),
);
console.log('MENU:', JSON.stringify([...new Set(items)], null, 2));
const del = page
  .getByRole('menuitem', { name: /Delete/i })
  .or(page.getByText(/^Delete (post|article)$/i))
  .first();
if (await del.count()) {
  await del.click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(out, 'activity-confirm.png') });
  const confirm = page
    .locator('#artdeco-modal-outlet')
    .getByRole('button', { name: /^Delete$/i });
  if (await confirm.count()) {
    await confirm.first().click();
    console.log('CONFIRMED DELETE');
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
} else console.log('no Delete item in menu');
await page.screenshot({ path: path.join(out, 'activity-after.png') });
console.log('final:', page.url());
await page.waitForTimeout(1500);
await browser.close();
