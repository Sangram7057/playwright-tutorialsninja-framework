import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const out = path.resolve('linkedin-post-assets', 'drive-shots');
fs.mkdirSync(out, { recursive: true });
const statePath = path.resolve('linkedin-post-assets', 'li-state.json');
const A = (f) => path.resolve('linkedin-post-assets', f);
const cover = A('card1.png');

const TITLE =
  'How I Built a Playwright + TypeScript Framework with Claude Code and MCP — A Complete Step-by-Step Guide';

// types: p (paragraph), h (bold header), code (lines[]), img (file)
const B = [
  {
    p: 'Most "AI wrote my tests" demos fall apart the moment a selector changes. So I tried something different: instead of asking an AI to guess test code, I gave it real tools — a browser, the filesystem, git — and let it inspect the actual application, generate stable locators, and build a production-grade framework step by step.',
  },
  {
    p: 'This is the complete, copy-paste walkthrough. Follow it top to bottom on a clean Windows machine (macOS / Linux notes inline) and you will end up with Claude Code installed, a set of MCP servers wired in, and a working Playwright + TypeScript automation framework that you built with the agent.',
  },

  { h: "What you're building (and what MCP is)" },
  {
    p: 'MCP (Model Context Protocol) is an open standard that lets an AI agent call real tools instead of only producing text. Claude Code is the MCP client (the agent). Each server you add is a new capability:',
  },
  {
    code: [
      'Playwright MCP          -> inspect the live app, generate stable locators',
      'Filesystem MCP          -> create / read / update project files',
      'Git MCP                 -> commit and review changes',
      'Memory MCP              -> remember architecture and conventions',
      'Sequential Thinking MCP -> break the work into ordered steps',
    ],
  },
  {
    p: 'In this project the agent uses the Playwright MCP to open the live application, read the real DOM, and generate stable locators — instead of guessing selectors. That single capability is what makes AI-generated tests reliable.',
  },

  { h: 'Step 1 — Prerequisites' },
  {
    p: 'You need three base tools installed and on PATH: Node.js 18+ (verify with node -v), Python 3.10+ (python --version), and Git (git --version).',
  },
  {
    p: 'Windows tips: when installing Python, tick "Add python.exe to PATH"; install Node.js LTS (the .msi); open a new PowerShell window afterward so PATH changes take effect. macOS / Linux: brew install node python git (or your package manager).',
  },

  { h: 'Step 2 — Install Claude Code' },
  { code: ['npm install -g @anthropic-ai/claude-code', 'claude --version'] },
  { p: 'Start it once in any folder to sign in (browser-based login):' },
  { code: ['claude'] },
  {
    p: 'Claude Code also runs as a desktop app and as VS Code / JetBrains extensions — the MCP steps below are identical in all of them.',
  },

  { h: 'Step 3 — Install uv / uvx (Python tool runner)' },
  { p: "Some MCP servers are Python packages launched with uvx (part of Astral's uv):" },
  { code: ['python -m pip install --user -U uv', 'uvx --version'] },
  {
    p: "Important PATH note (Windows): pip's user install puts the executables in C:\\Users\\<you>\\AppData\\Roaming\\Python\\Python3XX\\Scripts\\ (e.g. Python313), which is frequently NOT on PATH. Either add it to PATH:",
  },
  {
    code: [
      '$dir = "$env:APPDATA\\Python\\Python313\\Scripts"',
      '[Environment]::SetEnvironmentVariable("Path", "$([Environment]::GetEnvironmentVariable(\'Path\',\'User\'));$dir", "User")',
    ],
  },
  {
    p: '…and open a new terminal, or use the full path to uvx.exe everywhere a command says uvx. macOS / Linux: curl -LsSf https://astral.sh/uv/install.sh | sh puts uvx on PATH automatically.',
  },

  { h: 'Step 4 — Connect the MCP servers' },
  {
    p: "MCP servers are registered with: claude mcp add <name> [--scope user] -- <command...>. The --scope user flag makes the server available in every project. Swap <PROJECT_PATH> for your project's absolute path.",
  },
  {
    code: [
      '# Playwright MCP - inspect the app, generate stable locators',
      'claude mcp add playwright --scope user -- npx -y @playwright/mcp@latest',
      '',
      '# Filesystem MCP - create / read / update files',
      'claude mcp add filesystem --scope user -- npx -y @modelcontextprotocol/server-filesystem "<PROJECT_PATH>"',
      '',
      '# Git MCP - commit and review',
      'claude mcp add git --scope user -- uvx mcp-server-git --repository "<PROJECT_PATH>"',
      '',
      '# Memory MCP - remember architecture and conventions',
      'claude mcp add memory --scope user -- npx -y @modelcontextprotocol/server-memory',
      '',
      '# Sequential Thinking MCP - break work into ordered steps',
      'claude mcp add sequential-thinking --scope user -- npx -y @modelcontextprotocol/server-sequential-thinking',
    ],
  },
  { p: "If uvx / npx aren't on PATH, substitute their full paths." },

  { h: 'Step 5 — Verify every server is connected' },
  { code: ['claude mcp list'] },
  { p: 'You want a Connected status beside each one:' },
  {
    code: [
      'playwright:          Connected',
      'filesystem:          Connected',
      'git:                 Connected',
      'memory:              Connected',
      'sequential-thinking: Connected',
    ],
  },
  {
    p: 'MCP servers load at startup. If you added them while Claude Code was running, restart it (or run /mcp inside the session) so the new tools appear.',
  },

  { h: 'Step 6 — Build the framework with Claude Code' },
  {
    p: 'Open Claude Code inside the project folder and give it the standards as context:',
  },
  {
    p: 'Page Object Model — each page has locators, actions, and validations. No locators in test files. No assertions inside page actions.',
  },
  {
    p: 'Locator priority: data-testid, then id, name, role, text, css, and xpath only as a last resort.',
  },
  {
    p: 'SOLID / DRY / KISS, no magic numbers (use a constants folder), descriptive names, and auto-waiting — never Thread.sleep or fixed waits; prefer getByRole. Tests follow Arrange, Act, Assert; one scenario per test; independent and parallel-safe.',
  },
  { p: 'Example prompts that let the agent drive the tools:' },
  {
    p: '"Using the Playwright MCP, open the login page, inspect it, and generate stable locators using the priority order. Create a LoginPage page object with login() and validation methods — no locators in the spec."',
  },
  {
    p: '"Use the Sequential Thinking MCP to plan a @smoke suite, then use the Filesystem MCP to scaffold pages, components, fixtures, and tests."',
  },
  { p: '"Use the Git MCP to commit the new page object with a clear message."' },
  { p: 'The resulting structure:' },
  {
    code: [
      'config/       Environment config + Playwright global setup',
      'constants/    Routes & timeouts (no magic numbers)',
      'components/   Header / Navigation / Footer (reusable UI)',
      'pages/        BasePage + one object per page',
      'fixtures/     Page / test-data / auth fixtures',
      'utils/        Logger, faker data, env info, dates',
      'helpers/      Retry, screenshot, browser/session helpers',
      'test-data/    JSON test data',
      'tests/',
      '  smoke/      @smoke critical-path suite',
      '  regression/ @regression deeper suite',
      'reports/      HTML . Allure . JUnit',
    ],
  },

  { h: 'Step 7 — Run the tests and open the reports' },
  {
    code: [
      'npm ci                      # install dependencies',
      'npm run prepare:browsers    # install chromium / firefox / webkit',
      '',
      'npm test                    # full suite, all browsers',
      'npm run test:smoke          # @smoke only',
      'npm run test:regression     # @regression only',
      'npm run test:headed         # see the browser',
      '',
      'npm run report:html         # Playwright HTML report',
      'npm run report:allure       # generate + open Allure report',
    ],
  },
  { p: 'Quality gates (also run by CI and pre-commit hooks):' },
  {
    code: [
      'npm run typecheck           # tsc --noEmit',
      'npm run lint                # ESLint',
      'npm run format              # Prettier',
    ],
  },

  { h: 'The result' },
  {
    p: 'The executed suite runs 19 test cases — 18 passed and 1 intentionally gated (the full guest-checkout end-to-end only runs against an instance with guest checkout enabled). A clean, green Allure report with a 100% pass rate on everything executed, across smoke and regression, with screenshot, video, and trace captured on failure.',
  },
  { img: A('allure-overview.png') },
  { img: A('allure-graph.png') },

  { h: 'Troubleshooting (the things that actually bite)' },
  {
    p: 'uvx / uv "not recognized" → add ...\\Python3XX\\Scripts\\ to PATH (Step 3), or use the full uvx.exe path.',
  },
  {
    p: 'MCP shows "Failed to connect" → run the server\'s command manually in a terminal to read the real error; check the path passed to filesystem / git is valid.',
  },
  {
    p: 'New server not showing up → MCP servers load at startup; restart Claude Code or run /mcp.',
  },
  {
    p: 'Playwright "browser not found" → npm run prepare:browsers (or npx playwright install --with-deps).',
  },

  { h: 'Full command cheat-sheet' },
  {
    code: [
      '# Base tooling',
      'npm install -g @anthropic-ai/claude-code',
      'python -m pip install --user -U uv',
      '',
      '# MCP servers (user scope; swap <PROJECT_PATH>)',
      'claude mcp add playwright --scope user -- npx -y @playwright/mcp@latest',
      'claude mcp add filesystem --scope user -- npx -y @modelcontextprotocol/server-filesystem "<PROJECT_PATH>"',
      'claude mcp add git --scope user -- uvx mcp-server-git --repository "<PROJECT_PATH>"',
      'claude mcp add memory --scope user -- npx -y @modelcontextprotocol/server-memory',
      'claude mcp add sequential-thinking --scope user -- npx -y @modelcontextprotocol/server-sequential-thinking',
      '',
      '# Verify',
      'claude mcp list',
      '',
      '# Build & run',
      'npm ci',
      'npm run prepare:browsers',
      'npm test',
      'npm run report:allure',
    ],
  },

  { h: 'What surprised me' },
  {
    p: 'The quality of AI-built automation depends entirely on the tools you give the agent, not just the prompt. Letting it read the real DOM removed the number-one cause of flaky AI tests — guessed selectors. Validating every page object against the live site also surfaced real issues (asynchronous banners, duplicate elements, a checkout flow disabled on the demo) that the agent then fixed properly. AI did not replace the engineering. It accelerated it — while the standards, the architecture, and the review stayed human.',
  },

  { h: 'See the full project' },
  { p: 'Code and the complete step-by-step guide (COMPLETE-GUIDE.md) are on GitHub:' },
  { p: 'https://github.com/Sangram7057/playwright-tutorialsninja-framework' },
  {
    p: 'Your turn: are you letting your AI agent guess test code, or giving it real tools to work with? I would love to hear how you are approaching it.',
  },
  {
    p: '#Playwright #TestAutomation #QA #TypeScript #SDET #MCP #AI #ClaudeCode #SoftwareTesting #AutomationTesting',
  },
];

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({ viewport: null, storageState: statePath });
const page = await ctx.newPage();
const body = page.locator('div.ProseMirror[role="textbox"]');
const codeBtn = page
  .locator('button:has([data-test-icon="curly-braces-medium"])')
  .first();
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

await page.goto('https://www.linkedin.com/article/new/', {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(8000);

// Cover
const [cc] = await Promise.all([
  page.waitForEvent('filechooser', { timeout: 15000 }),
  page.getByRole('button', { name: /Upload from computer/i }).click(),
]);
await cc.setFiles(cover);
await page.waitForTimeout(5000);
await closeModal();
await page.waitForTimeout(1500);
console.log('cover done');

// Title
const title = page.locator('textarea.article-editor-headline__textarea');
await title.click();
await title.fill(TITLE);
console.log('title done');

// Body
await body.click();
await page.waitForTimeout(400);
let needNewPara = false;
for (let i = 0; i < B.length; i++) {
  const blk = B[i];
  if (needNewPara && !('img' in blk)) await page.keyboard.press('Enter');

  if ('p' in blk) {
    await page.keyboard.insertText(blk.p);
    needNewPara = true;
  } else if ('h' in blk) {
    await page.keyboard.press('Control+b');
    await page.keyboard.insertText(blk.h);
    await page.keyboard.press('Control+b');
    needNewPara = true;
  } else if ('code' in blk) {
    await codeBtn.click();
    await page.waitForTimeout(250);
    for (let j = 0; j < blk.code.length; j++) {
      await page.keyboard.insertText(blk.code[j]);
      if (j < blk.code.length - 1) await page.keyboard.press('Enter');
    }
    await page.keyboard.press('Control+Enter'); // exit code block -> fresh paragraph
    needNewPara = false;
  } else if ('img' in blk) {
    // ensure cursor at end before inserting
    await body.click();
    await page.keyboard.press('Control+End');
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 12000 }),
      imgBtn.click(),
    ]);
    await chooser.setFiles(blk.img);
    await page.waitForTimeout(4000);
    await closeModal();
    await page.waitForTimeout(1500);
    await body.click();
    await page.keyboard.press('Control+End');
    needNewPara = false;
  }
  await page.waitForTimeout(120);
}
console.log('body done');

await page.waitForTimeout(9000); // autosave
const editUrl = page.url();
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(out, 'v2-top.png') });
fs.writeFileSync(path.join(out, 'v2-edit-url.txt'), editUrl);
console.log(JSON.stringify({ editUrl }, null, 2));

await page.waitForTimeout(1500);
await browser.close();
