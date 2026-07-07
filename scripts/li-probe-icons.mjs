import { chromium } from 'playwright';
const statePath = 'D:/Plawright MCP with Claude/linkedin-post-assets/li-state.json';

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({ viewport: null, storageState: statePath });
const page = await ctx.newPage();
await page.goto('https://www.linkedin.com/article/new/', {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(8000);

const data = await page.evaluate(() => {
  // Find the toolbar that contains the heading dropdown trigger
  const trigger = document.querySelector(
    '.article-editor-toolbar__heading-dropdown-trigger',
  );
  let bar = trigger;
  for (let i = 0; i < 6 && bar; i++) {
    if (bar.querySelectorAll('button').length >= 5) break;
    bar = bar.parentElement;
  }
  const btns = bar ? [...bar.querySelectorAll('button')] : [];
  return btns.map((b, i) => {
    const svg = b.querySelector('svg, li-icon, use');
    const icon =
      b.getAttribute('aria-label') ||
      (svg && (svg.getAttribute('data-test-icon') || svg.getAttribute('type'))) ||
      (b.querySelector('use') && b.querySelector('use').getAttribute('href')) ||
      '';
    return {
      i,
      cls: (b.className || '').toString().slice(0, 55),
      icon,
      txt: (b.textContent || '').trim().slice(0, 14),
    };
  });
});
console.log(JSON.stringify(data, null, 2));
await page.waitForTimeout(800);
await browser.close();
