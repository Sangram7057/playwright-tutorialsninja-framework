import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const out = path.resolve('linkedin-post-assets', 'drive-shots');
fs.mkdirSync(out, { recursive: true });
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const cover = path.resolve('linkedin-post-assets', 'card1.png');

const TITLE =
  "I Built an Enterprise Playwright Automation Framework with Claude Code and MCP — Here's How";

// {h:true} => bold section header line
const BLOCKS = [
  {
    t: 'Most "AI wrote my tests" demos fall apart the moment a selector changes. So I tried something different: instead of asking an AI to guess test code, I gave it real tools and let it inspect the actual application, generate stable locators, and build a production-grade framework step by step.',
  },
  {
    t: 'The result is a complete Playwright + TypeScript automation framework — Page Object Model, fixtures, cross-browser, Allure reporting, and CI — built with Claude Code driving MCP servers. Here is exactly how I did it.',
  },
  { h: true, t: 'What is MCP, and why it matters' },
  {
    t: 'MCP (Model Context Protocol) is an open standard that lets an AI agent call real tools — a browser, the filesystem, git — instead of only producing text. Claude Code is the agent, and each MCP server adds a capability:',
  },
  {
    t: 'Playwright MCP opens the live app, reads the real DOM, and generates stable locators. Filesystem MCP creates and updates project files. Git MCP commits work with clear messages. Memory MCP remembers architecture and conventions across sessions. Sequential Thinking MCP breaks the work into ordered phases.',
  },
  {
    t: 'The Playwright MCP is the game changer. Because the agent reads the real page instead of guessing, the generated locators are stable — and that is what makes AI-written tests actually reliable.',
  },
  { h: true, t: 'How it was built' },
  {
    t: '1) Set up the agent and its tools — install Claude Code, then connect the MCP servers and confirm each one is connected.',
  },
  {
    t: '2) Let the agent inspect the real application — the Playwright MCP opens each page, reads the DOM, and proposes locators using a strict priority: data-testid, then id, name, role, text, and CSS, with XPath only as a last resort.',
  },
  {
    t: '3) Build the framework in phases — foundation (config, logging, TypeScript, ESLint, Prettier), a logged auto-waiting BasePage, reusable Header / Navigation / Footer components, one Page Object per screen, and fixtures that inject page objects, test data, and an authenticated session.',
  },
  {
    t: '4) Write the tests the right way — smoke tests for critical paths, then a deeper regression suite. Every test follows Arrange, Act, Assert. No locators in test files. No assertions inside page actions. Tests are independent and parallel-safe.',
  },
  {
    t: '5) Add reporting and CI — Allure, HTML, and JUnit reports with screenshot, video, and trace on failure, plus a GitHub Actions pipeline that lints, runs the suite across Chromium, Firefox, and WebKit, and publishes the report.',
  },
  { h: true, t: 'The result' },
  {
    t: 'The executed suite runs 19 test cases — 18 passed and 1 intentionally gated (the full guest-checkout end-to-end only runs against an instance with guest checkout enabled). A clean, green Allure report with a 100% pass rate on everything executed.',
  },
  { h: true, t: 'What it ships' },
  {
    t: 'Page Object Model with zero duplicate code. Cross-browser execution on Chromium, Firefox, and WebKit. Reusable fixtures and authenticated sessions. Allure, HTML, and JUnit reports with failure diagnostics. GitHub Actions CI with caching and a quality gate.',
  },
  { h: true, t: 'What surprised me' },
  {
    t: 'The quality of AI-built automation depends entirely on the tools you give the agent, not just the prompt. Letting it read the real DOM removed the number-one cause of flaky AI tests — guessed selectors. Validating every page object against the live site also surfaced real issues (asynchronous banners, duplicate elements, a checkout flow disabled on the demo) that the agent then fixed properly. AI did not replace the engineering. It accelerated it — while the standards, the architecture, and the review stayed human.',
  },
  { h: true, t: 'See the full project' },
  {
    t: 'Code and a complete step-by-step guide are on GitHub: https://github.com/Sangram7057/playwright-tutorialsninja-framework',
  },
  {
    t: 'Your turn: if you are experimenting with AI in test automation, are you letting the agent guess, or giving it real tools to work with? I would love to hear how you are approaching it.',
  },
  {
    t: '#Playwright #TestAutomation #QA #TypeScript #SDET #MCP #AI #SoftwareTesting #AutomationTesting #ClaudeCode',
  },
];

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({ viewport: null, storageState: statePath });
const page = await ctx.newPage();

await page.goto('https://www.linkedin.com/article/new/', {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(8000);

// 1) Cover image
try {
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 15000 }),
    page.getByRole('button', { name: /Upload from computer/i }).click(),
  ]);
  await chooser.setFiles(cover);
  console.log('cover: file set');
  await page.waitForTimeout(5000);
  // Click through the media-editor modal (Next -> Done/Save/Apply) until it closes.
  for (let step = 0; step < 5; step++) {
    const modalOpen = await page.evaluate(
      () => !!document.querySelector('#artdeco-modal-outlet .artdeco-modal'),
    );
    if (!modalOpen) {
      console.log('cover: modal closed');
      break;
    }
    let clicked = false;
    for (const name of [/^Next$/i, /^Done$/i, /^Save$/i, /^Apply$/i]) {
      const b = page.locator('#artdeco-modal-outlet').getByRole('button', { name });
      if (await b.count()) {
        try {
          await b.first().click({ timeout: 4000 });
          console.log('cover: clicked', name);
          clicked = true;
          break;
        } catch {}
      }
    }
    if (!clicked) {
      console.log('cover: no progress button found');
      break;
    }
    await page.waitForTimeout(2500);
  }
  await page.waitForTimeout(2000);
} catch (e) {
  console.log('cover upload skipped:', e.message);
}

// 2) Title
const title = page.locator('textarea.article-editor-headline__textarea');
await title.click();
await title.fill(TITLE);
console.log('title set');
await page.waitForTimeout(800);

// 3) Body
const body = page.locator('div.ProseMirror[role="textbox"]');
await body.click();
await page.waitForTimeout(500);
for (let i = 0; i < BLOCKS.length; i++) {
  const b = BLOCKS[i];
  if (b.h) {
    await page.keyboard.press('Control+b');
    await page.keyboard.insertText(b.t);
    await page.keyboard.press('Control+b');
  } else {
    await page.keyboard.insertText(b.t);
  }
  if (i < BLOCKS.length - 1) await page.keyboard.press('Enter');
  await page.waitForTimeout(120);
}
console.log('body typed');

// Let LinkedIn autosave the draft.
await page.waitForTimeout(9000);
const editUrl = page.url();
await page.screenshot({ path: path.join(out, '04-filled-top.png') });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(out, '04-filled-bottom.png') });

const titleVal = await title.inputValue().catch(() => '');
const bodyLen = await body
  .innerText()
  .then((t) => t.length)
  .catch(() => 0);
console.log(JSON.stringify({ editUrl, titleLen: titleVal.length, bodyLen }, null, 2));

await page.waitForTimeout(1500);
await browser.close();
