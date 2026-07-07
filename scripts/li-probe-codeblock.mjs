import { chromium } from 'playwright';
const statePath = 'D:/Plawright MCP with Claude/linkedin-post-assets/li-state.json';

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({ viewport: null, storageState: statePath });
const page = await ctx.newPage();
await page.goto('https://www.linkedin.com/article/new/', {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(8000);

const codeBtn = page
  .locator('button:has([data-test-icon="curly-braces-medium"])')
  .first();
const body = page.locator('div.ProseMirror[role="textbox"]');
const html = async (tag) =>
  console.log(
    tag,
    '=>',
    (await body.evaluate((el) => el.innerHTML)).replace(/\s+class="[^"]*"/g, ''),
  );

await body.click();
await page.keyboard.insertText('PARA ONE');
await page.keyboard.press('Enter');

// enter code block
await codeBtn.click();
await page.waitForTimeout(400);
await page.keyboard.insertText('npm install -g foo');
await page.keyboard.press('Enter');
await page.keyboard.insertText('claude --version');
await html('AFTER_CODE_TYPING');

// Attempt exit method 1: Control+Enter (exitCode)
await page.keyboard.press('Control+Enter');
await page.keyboard.insertText('AFTER_CTRL_ENTER');
await html('AFTER_CTRL_ENTER');

await page.waitForTimeout(800);
await browser.close();
