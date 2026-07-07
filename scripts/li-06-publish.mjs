import { chromium } from 'playwright';
import path from 'node:path';

const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const EDIT_URL = 'https://www.linkedin.com/article/edit/7477702959062081537/';

const COMMENTARY =
  "I let an AI agent build a senior-grade Playwright + TypeScript test framework — by giving it real tools (MCP) to inspect the live app and generate stable locators, instead of guessing test code. Here's exactly how, end to end. 👇";

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({ viewport: null, storageState: statePath });
const page = await ctx.newPage();
await page.goto(EDIT_URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

// Open the publish modal
await page
  .getByRole('button', { name: /^Next$/i })
  .first()
  .click();
await page.waitForTimeout(4000);

const modal = page.locator('#artdeco-modal-outlet');

// Optional commentary
try {
  const box = modal.locator('[contenteditable="true"], [role="textbox"]').first();
  await box.click({ timeout: 5000 });
  await page.keyboard.insertText(COMMENTARY);
  console.log('commentary added');
  await page.waitForTimeout(1500);
} catch (e) {
  console.log('commentary skipped:', e.message);
}

await page.screenshot({ path: path.join(out, '06-before-publish.png') });

// Publish
const publishBtn = modal.getByRole('button', { name: /^Publish$/i });
if (!(await publishBtn.count())) {
  console.log('ABORT: Publish button not found');
  await browser.close();
  process.exit(2);
}
await publishBtn.first().click();
console.log('clicked Publish');
await page.waitForTimeout(10000);

const finalUrl = page.url();
await page.screenshot({ path: path.join(out, '06-published.png') });
console.log(JSON.stringify({ finalUrl }, null, 2));

await page.waitForTimeout(2000);
await browser.close();
