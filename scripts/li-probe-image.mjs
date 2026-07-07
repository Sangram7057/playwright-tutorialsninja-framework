import { chromium } from 'playwright';
import path from 'node:path';
const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const img = path.resolve('linkedin-post-assets', 'allure-overview.png');

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({ viewport: null, storageState: statePath });
const page = await ctx.newPage();
await page.goto('https://www.linkedin.com/article/new/', {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(8000);

const body = page.locator('div.ProseMirror[role="textbox"]');
const imgBtn = page.locator('button:has([data-test-icon="image-medium"])').first();

await body.click();
await page.keyboard.insertText('Result section paragraph.');
await page.keyboard.press('Enter');

// Click image button and capture whether a filechooser opens
try {
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 8000 }),
    imgBtn.click(),
  ]);
  await chooser.setFiles(img);
  console.log('image: filechooser used');
} catch (e) {
  console.log('no filechooser; maybe a modal opened:', e.message);
}
await page.waitForTimeout(5000);
await page.screenshot({ path: path.join(out, 'probe-image-1.png') });

// Handle media modal if present (Next/Done loop)
for (let s = 0; s < 5; s++) {
  const open = await page.evaluate(
    () => !!document.querySelector('#artdeco-modal-outlet .artdeco-modal'),
  );
  if (!open) {
    console.log('modal closed at step', s);
    break;
  }
  let clicked = false;
  for (const name of [/^Next$/i, /^Done$/i, /^Save$/i, /^Apply$/i, /^Insert$/i]) {
    const b = page.locator('#artdeco-modal-outlet').getByRole('button', { name });
    if (await b.count()) {
      try {
        await b.first().click({ timeout: 4000 });
        console.log('clicked', name);
        clicked = true;
        break;
      } catch {}
    }
  }
  if (!clicked) break;
  await page.waitForTimeout(2500);
}
await page.waitForTimeout(2000);
await page.screenshot({ path: path.join(out, 'probe-image-2.png') });
const html = await body.evaluate((el) => el.innerHTML);
console.log('HTML:', html.replace(/\s+class="[^"]*"/g, '').slice(0, 600));

await page.waitForTimeout(1000);
await browser.close();
