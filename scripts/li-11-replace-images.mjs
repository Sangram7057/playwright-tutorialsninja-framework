import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const editUrl = fs.readFileSync(path.join(out, 'v2-edit-url.txt'), 'utf8').trim();
const NEW = [
  path.resolve('linkedin-post-assets', 'allure-overview-allpass.png'),
  path.resolve('linkedin-post-assets', 'allure-graph-allpass.png'),
];

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

async function insertImage(file) {
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 12000 }),
    imgBtn.click(),
  ]);
  await chooser.setFiles(file);
  await page.waitForTimeout(4000);
  await closeModal();
  await page.waitForTimeout(1500);
}

await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

// 1) Delete existing figures
for (let g = 0; g < 6; g++) {
  const figs = page.locator('div.ProseMirror figure');
  if ((await figs.count()) === 0) break;
  await figs.first().scrollIntoViewIfNeeded();
  await figs.first().hover();
  await page.waitForTimeout(400);
  await figs
    .first()
    .getByRole('button', { name: /Delete image/i })
    .click();
  await page.waitForTimeout(1200);
}
console.log(
  'figures after delete:',
  await page.locator('div.ProseMirror figure').count(),
);

// 2) Anchor cursor at end of the result paragraph
const resultP = page
  .locator('div.ProseMirror p', { hasText: 'The executed suite runs' })
  .first();
await resultP.scrollIntoViewIfNeeded();
await resultP.click();
await page.keyboard.press('End');
await page.keyboard.press('Enter');

// 3) Insert new image 1
await insertImage(NEW[0]);

// 4) Reselect after the new figure, move cursor past it
const fig1 = page.locator('div.ProseMirror figure').last();
await fig1.click({ position: { x: 30, y: 30 } });
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(400);

// 5) Insert new image 2
await insertImage(NEW[1]);

await page.waitForTimeout(8000); // autosave
// Screenshot around the result section
const rp = page
  .locator('div.ProseMirror p', { hasText: 'The executed suite runs' })
  .first();
await rp.scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(out, 'replace-1.png') });
await page.evaluate(() => window.scrollBy(0, 900));
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(out, 'replace-2.png') });
console.log('figures now:', await page.locator('div.ProseMirror figure').count());

await page.waitForTimeout(1500);
await browser.close();
