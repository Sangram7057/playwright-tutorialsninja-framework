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
await page.waitForTimeout(8000);

// Identify overflow buttons by icon
const info = await page.evaluate(() =>
  [...document.querySelectorAll('button')]
    .map((b, i) => {
      const ic = b.querySelector('[data-test-icon]');
      return {
        i,
        aria: b.getAttribute('aria-label'),
        icon: ic ? ic.getAttribute('data-test-icon') : null,
      };
    })
    .filter((x) => x.icon && /overflow|ellipsis|menu/i.test(x.icon)),
);
console.log('OVERFLOW BUTTONS:', JSON.stringify(info, null, 2));

// Click the overflow (three-dot) button near the byline
const overflows = page.locator('button:has([data-test-icon*="overflow"])');
const ocount = await overflows.count();
console.log('overflow count', ocount);
// The byline (author) menu is the one we want; try the last overflow button.
const overflow = overflows.nth(ocount - 1);
await overflow.scrollIntoViewIfNeeded();
await overflow.click();
console.log('clicked overflow nth', ocount - 1);
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(out, 'pulse-overflow-menu.png') });

const menuItems = await page.evaluate(() => [
  ...new Set(
    [
      ...document.querySelectorAll(
        '[role="menuitem"], .artdeco-dropdown__content *, [role="menu"] *',
      ),
    ]
      .map((e) => (e.getAttribute('aria-label') || e.textContent || '').trim())
      .filter((t) => t && t.length < 50),
  ),
]);
console.log('MENU ITEMS:', JSON.stringify(menuItems, null, 2));

const del = page.getByText(/^Delete( article| post)?$/i).first();
if (await del.count()) {
  await del.click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(out, 'pulse2-confirm.png') });
  const confirm = page
    .locator('#artdeco-modal-outlet')
    .getByRole('button', { name: /^(Delete|Delete article)$/i });
  if (await confirm.count()) {
    await confirm.first().click();
    console.log('CONFIRMED DELETE');
    await page.waitForTimeout(6000);
  } else
    console.log(
      'confirm buttons:',
      JSON.stringify(
        await page
          .locator('#artdeco-modal-outlet button')
          .allInnerTexts()
          .catch(() => []),
      ),
    );
} else {
  console.log('no Delete item');
}
await page.screenshot({ path: path.join(out, 'pulse2-after.png') });
console.log('final url:', page.url());
await page.waitForTimeout(1500);
await browser.close();
