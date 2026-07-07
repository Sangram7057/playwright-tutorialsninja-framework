import { chromium } from 'playwright';
import path from 'node:path';

const out = path.resolve('linkedin-post-assets', 'drive-shots');
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({ viewport: null, storageState: statePath });
const page = await ctx.newPage();
await page.goto('https://www.linkedin.com/article/new/', {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(8000);

// Dump toolbar buttons with aria-labels
const toolbar = await page.evaluate(() => {
  const bar = document.querySelector('.article-editor-toolbar, [class*="toolbar"]');
  const scope = bar || document;
  return [...scope.querySelectorAll('button')]
    .map((b) => ({
      aria: b.getAttribute('aria-label'),
      title: b.getAttribute('title'),
      cls: (b.className || '').toString().slice(0, 60),
      txt: (b.textContent || '').trim().slice(0, 20),
    }))
    .filter((x) => x.aria || x.title || x.cls.includes('artdeco'))
    .slice(0, 40);
});
console.log('TOOLBAR:', JSON.stringify(toolbar, null, 2));

// Test code block: type a line, then toggle code via toolbar button if found
const body = page.locator('div.ProseMirror[role="textbox"]');
await body.click();
await page.keyboard.insertText('intro paragraph');
await page.keyboard.press('Enter');

// Try a code-block button (guess several aria-labels)
const codeCandidates = ['Code block', 'Code', 'Insert code block', 'Preformatted'];
let codeLabel = null;
for (const c of codeCandidates) {
  const b = page.getByRole('button', { name: new RegExp('^' + c + '$', 'i') });
  if (await b.count()) {
    codeLabel = c;
    break;
  }
}
console.log('codeLabel found:', codeLabel);
if (codeLabel) {
  await page
    .getByRole('button', { name: new RegExp('^' + codeLabel + '$', 'i') })
    .first()
    .click();
  await page.keyboard.insertText('npm install -g foo');
  await page.keyboard.press('Enter');
  await page.keyboard.insertText('claude --version');
  await page.waitForTimeout(500);
}

const html = await body.evaluate((el) => el.innerHTML);
console.log('BODY HTML:', html.slice(0, 1200));

await page.screenshot({ path: path.join(out, 'probe-format.png') });
await page.waitForTimeout(1500);
await browser.close();
