import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const EDIT_URL = fs.readFileSync(path.join(out, 'v2-edit-url.txt'), 'utf8').trim();

const COMMENTARY =
  "A complete, copy-paste guide: how I built a Playwright + TypeScript framework with Claude Code + MCP — every install step, the MCP setup, the locator strategy, and the green Allure report. If you're doing QA automation, this is the full walkthrough. 👇";

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({ viewport: null, storageState: statePath });
const page = await ctx.newPage();
await page.goto(EDIT_URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

await page
  .getByRole('button', { name: /^Next$/i })
  .first()
  .click();
await page.waitForTimeout(4000);

const modal = page.locator('#artdeco-modal-outlet');
try {
  const box = modal.locator('[contenteditable="true"], [role="textbox"]').first();
  await box.click({ timeout: 5000 });
  await page.keyboard.insertText(COMMENTARY);
  console.log('commentary added');
  await page.waitForTimeout(1500);
} catch (e) {
  console.log('commentary skipped:', e.message);
}

await page.screenshot({ path: path.join(out, 'v2-before-publish.png') });

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
await page.screenshot({ path: path.join(out, 'v2-published.png') });
console.log(JSON.stringify({ finalUrl }, null, 2));
await page.waitForTimeout(2000);
await browser.close();
