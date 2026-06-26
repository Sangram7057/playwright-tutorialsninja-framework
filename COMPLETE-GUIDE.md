# From Zero to a Playwright Framework Built with Claude Code + MCP — Complete Guide

A single, self-contained walkthrough. Follow it top to bottom on a clean machine
and you will end up with:

- **Claude Code** installed and signed in.
- A set of **MCP (Model Context Protocol) servers** wired into Claude Code:
  Playwright, Filesystem, Git, Memory, Sequential Thinking, and the optional
  LinkedIn MCP.
- A working **Playwright + TypeScript** automation framework built and run with
  the agent's help.
- A finished **LinkedIn post** (text + images) about the project.

Commands are shown for **Windows (PowerShell)** — the primary target — with
**macOS/Linux** notes inline. Replace placeholders like `<you>` and
`<PROJECT_PATH>` with your own values.

---

## Table of contents

1. [What you're building (and what MCP is)](#1-what-youre-building-and-what-mcp-is)
2. [Prerequisites — install the base tools](#2-prerequisites--install-the-base-tools)
3. [Install Claude Code](#3-install-claude-code)
4. [Install uv / uvx (Python tool runner)](#4-install-uv--uvx-python-tool-runner)
5. [Connect the MCP servers](#5-connect-the-mcp-servers)
6. [Verify every server is connected](#6-verify-every-server-is-connected)
7. [Build the framework with Claude Code](#7-build-the-framework-with-claude-code)
8. [Run the tests and open reports](#8-run-the-tests-and-open-reports)
9. [The LinkedIn MCP (optional)](#9-the-linkedin-mcp-optional)
10. [Generate the post images](#10-generate-the-post-images)
11. [Write and publish the LinkedIn post](#11-write-and-publish-the-linkedin-post)
12. [Troubleshooting](#12-troubleshooting)
13. [Full command cheat-sheet](#13-full-command-cheat-sheet)

---

## 1. What you're building (and what MCP is)

**MCP (Model Context Protocol)** is an open standard that lets an AI agent _call
real tools_ — a browser, the filesystem, git, external APIs — instead of only
producing text. **Claude Code is the MCP client (the agent).** Each server you add
is a new capability.

```
                 ┌──────────────────────────────┐
                 │          Claude Code           │   ← the agent (MCP client)
                 └──────────────┬─────────────────┘
        ┌────────────┬──────────┼───────────┬─────────────────┐
   Playwright    Filesystem    Git        Memory      Sequential Thinking
     MCP            MCP        MCP          MCP               MCP
  inspect app,   read/write   commit,    remember        plan work in
  gen locators    files      review     conventions      ordered steps
```

In this project the agent uses **Playwright MCP** to open the live application,
read the real DOM, and generate **stable locators** — instead of guessing
selectors. That single capability is what makes AI-generated tests reliable.

---

## 2. Prerequisites — install the base tools

| Tool        | Min version          | Verify             | Download              |
| ----------- | -------------------- | ------------------ | --------------------- |
| **Node.js** | 18 (LTS recommended) | `node -v`          | <https://nodejs.org>  |
| **Python**  | 3.10+                | `python --version` | <https://python.org>  |
| **Git**     | any recent           | `git --version`    | <https://git-scm.com> |

Windows tips:

- When installing **Python**, tick **"Add python.exe to PATH"**.
- Install **Node.js LTS** (the `.msi`); it adds `node` and `npm` to PATH.
- Open a **new** PowerShell window after installing so PATH changes take effect.

macOS/Linux: install via your package manager (`brew install node python git`, or
`apt install …`).

---

## 3. Install Claude Code

```powershell
npm install -g @anthropic-ai/claude-code
claude --version
```

Start it once in any folder to sign in (browser-based login):

```powershell
claude
```

> Claude Code also runs as a desktop app and as VS Code / JetBrains extensions.
> The MCP steps below behave identically in all of them.

---

## 4. Install uv / uvx (Python tool runner)

Some MCP servers are Python packages launched with **`uvx`** (part of Astral's
`uv`). Install `uv`:

```powershell
python -m pip install --user -U uv
```

**Important PATH note (Windows):** pip's user install puts the executables in
`C:\Users\<you>\AppData\Roaming\Python\Python3XX\Scripts\` (e.g. `Python313`),
which is frequently **not on PATH**. Two options:

- **Add it to PATH** (recommended) — then `uvx` works everywhere. In PowerShell:
  ```powershell
  $dir = "$env:APPDATA\Python\Python313\Scripts"
  [Environment]::SetEnvironmentVariable("Path", "$([Environment]::GetEnvironmentVariable('Path','User'));$dir", "User")
  ```
  Open a new terminal afterward.
- **Or use the full path** to `uvx.exe` everywhere a command below says `uvx`,
  e.g. `"C:\Users\<you>\AppData\Roaming\Python\Python313\Scripts\uvx.exe"`.

Verify:

```powershell
uvx --version
```

> macOS/Linux: `curl -LsSf https://astral.sh/uv/install.sh | sh` installs `uv`
> and puts `uvx` on PATH automatically.

---

## 5. Connect the MCP servers

MCP servers are registered with:

```
claude mcp add <name> [--scope user] -- <command...>
```

- `--scope user` makes the server available in **every** project (stored in
  `~/.claude.json`). Omit it to scope the server to the **current project** only.
- Everything after `--` is the command Claude Code runs to start the server.
- If `uvx`/`npx` are not on PATH, substitute their full paths.

Run each of these (swap `<PROJECT_PATH>` for your project's absolute path, e.g.
`D:\Plawright MCP with Claude`):

### 5a. Playwright MCP — inspect the app, generate stable locators

```powershell
claude mcp add playwright --scope user -- npx -y @playwright/mcp@latest
```

### 5b. Filesystem MCP — create / read / update files

```powershell
claude mcp add filesystem --scope user -- npx -y @modelcontextprotocol/server-filesystem "<PROJECT_PATH>"
```

The trailing path is the directory the server is allowed to touch. You can pass
several paths.

### 5c. Git MCP — commit & review

```powershell
claude mcp add git --scope user -- uvx mcp-server-git --repository "<PROJECT_PATH>"
```

### 5d. Memory MCP — remember architecture & conventions

```powershell
claude mcp add memory --scope user -- npx -y @modelcontextprotocol/server-memory
```

### 5e. Sequential Thinking MCP — break work into ordered steps

```powershell
claude mcp add sequential-thinking --scope user -- npx -y @modelcontextprotocol/server-sequential-thinking
```

> Example with a full `uvx` path (when it isn't on PATH):
>
> ```powershell
> claude mcp add git --scope user -- "C:\Users\<you>\AppData\Roaming\Python\Python313\Scripts\uvx.exe" mcp-server-git --repository "<PROJECT_PATH>"
> ```

---

## 6. Verify every server is connected

```powershell
claude mcp list
```

You want a `✓ Connected` beside each server, e.g.:

```
playwright:          ✓ Connected
filesystem:          ✓ Connected
git:                 ✓ Connected
memory:              ✓ Connected
sequential-thinking: ✓ Connected
```

**MCP servers load at startup.** If you added them while Claude Code was running,
**restart it** (or run `/mcp` inside the session) so the new tools appear.

---

## 7. Build the framework with Claude Code

Open Claude Code **inside the project folder** and let the agent drive the tools.
The framework follows these standards (give them to the agent as context):

- **Page Object Model** — each page has locators, actions, validations.
  **No locators in test files. No assertions inside page actions.**
- **Locator priority:** `data-testid` → `id` → `name` → `role` → `text` → `css` →
  `xpath` (last resort).
- **SOLID / DRY / KISS**, no magic numbers (use `constants/`), descriptive names.
- **Auto-waiting** — never `Thread.sleep`/fixed waits; prefer `getByRole`.
- **Test design** — Arrange / Act / Assert, one scenario per test, independent,
  parallel-safe.

Example prompts:

> "Using the **Playwright MCP**, open `https://tutorialsninja.com/demo/`, inspect
> the login page, and generate stable locators using the priority order. Create a
> `LoginPage` page object with `login()` / validation methods — no locators in the
> spec."

> "Use the **Sequential Thinking MCP** to plan a `@smoke` suite, then use the
> **Filesystem MCP** to scaffold `pages/`, `components/`, `fixtures/`, `tests/`."

> "Use the **Git MCP** to commit the new page object with a clear message."

The resulting structure:

```
config/        Environment config + Playwright global setup
constants/     Routes & timeouts (no magic numbers)
components/    Header / Navigation / Footer (reusable UI)
pages/         BasePage + one object per page
fixtures/      Page / test-data / auth fixtures
utils/         Logger, faker data, env info, dates
helpers/       Retry, screenshot, browser/session helpers
test-data/     JSON test data
tests/
  smoke/       @smoke critical-path suite
  regression/  @regression deeper suite
reports/       HTML · Allure · JUnit (git-ignored)
```

---

## 8. Run the tests and open reports

First-time setup:

```powershell
npm ci                     # install dependencies (from package-lock.json)
npm run prepare:browsers   # install Playwright browsers (chromium/firefox/webkit)
```

Run tests:

```powershell
npm test                 # full suite, all browsers
npm run test:smoke       # @smoke only
npm run test:regression  # @regression only
npm run test:chromium    # single browser
npm run test:headed      # see the browser
npm run test:ui          # Playwright UI mode
npm run test:debug       # debugger
```

Reports:

```powershell
npm run report:html      # Playwright HTML report
npm run report:allure    # generate + open Allure report
```

Quality gates (also run by CI / pre-commit hooks):

```powershell
npm run typecheck        # tsc --noEmit
npm run lint             # ESLint
npm run format           # Prettier
```

---

## 9. The LinkedIn MCP (optional)

For reading profiles, companies, jobs and your feed, sending connection requests
and DMs. **It is read / connect / message only — it CANNOT publish a post to your
feed.**

### 9a. Log in (one-time — opens a real browser)

```powershell
uvx mcp-server-linkedin@latest --login
```

Log in manually in the window that opens (handles 2FA/captcha). The session is
saved to `~/.linkedin-mcp/profile`.

- Check session: `uvx mcp-server-linkedin@latest --status`
- Clear session: `uvx mcp-server-linkedin@latest --logout`

### 9b. Register it

```powershell
claude mcp add linkedin --scope user -- uvx mcp-server-linkedin@latest
```

(Use the full `uvx.exe` path if it isn't on PATH.) Restart Claude Code, then
`claude mcp list` should show `linkedin ✓ Connected`.

Available tools: `get_my_profile`, `get_person_profile`, `search_people`,
`connect_with_person`, `get_sidebar_profiles`, `get_company_profile`,
`get_company_posts`, `search_companies`, `get_company_employees`,
`get_job_details`, `search_jobs`, `get_inbox`, `get_conversation`,
`search_conversations`, `send_message`, `get_feed`.

---

## 10. Generate the post images

Render clean PNG "cards" using the Playwright that's already installed in the
project. Save the cards as HTML, then screenshot them.

1. Create an `html/` folder with one file per card (title card, architecture
   diagram, project structure, tech stack). Use simple inline CSS — a dark
   background, a 1200×1200 body, big readable text.

2. Create a render script **inside the project** (so `playwright` resolves from
   `node_modules`), e.g. `render.mjs`:

   ```js
   import { chromium } from 'playwright';
   import path from 'node:path';
   import fs from 'node:fs';

   const htmlDir = path.resolve('html');
   const out = path.resolve('linkedin-post-assets');
   fs.mkdirSync(out, { recursive: true });

   const cards = ['card1', 'card2', 'card3', 'card4'];
   const browser = await chromium.launch();
   const page = await browser.newPage({
     viewport: { width: 1200, height: 1200 },
     deviceScaleFactor: 2, // retina-sharp output
   });
   for (const c of cards) {
     await page.goto('file://' + path.join(htmlDir, c + '.html'));
     await page.waitForTimeout(250);
     await page.screenshot({ path: path.join(out, c + '.png') });
     console.log('wrote', c + '.png');
   }
   await browser.close();
   ```

3. Run it from the project root:
   ```powershell
   node render.mjs
   ```

PNGs land in `linkedin-post-assets/` at 2400×2400 (1200 × `deviceScaleFactor` 2).

> If you don't want these committed, add `linkedin-post-assets/` to `.gitignore`.

---

## 11. Write and publish the LinkedIn post

No MCP can publish to the feed, so this last step is manual (~30 seconds).

1. Draft the text. A professional/technical structure that works well:
   - **Hook** — "I built an enterprise-grade Playwright framework, and an AI agent
     did the heavy lifting by driving real tools."
   - **The how** — Claude Code + MCP servers (name each and what it did).
   - **Why Playwright MCP matters** — inspects the real DOM, generates stable
     locators by priority instead of guessing.
   - **What it ships** — POM, fixtures, cross-browser, Allure/HTML/JUnit, CI.
   - **Call to action** — a question to drive comments.
   - **Hashtags** — `#Playwright #TestAutomation #QA #TypeScript #SDET #MCP #AI`.

2. On LinkedIn → **Start a post** → paste the text → **attach the PNGs** (lead with
   the architecture card, end with the tech-stack card) → **Post**.

---

## 12. Troubleshooting

| Symptom                                                | Fix                                                                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `uvx` / `uv` "not recognized"                          | Add `…\Python3XX\Scripts\` to PATH (see step 4), or use the full `uvx.exe` path in commands.                              |
| MCP shows `✗ Failed to connect`                        | Run the server's command manually in a terminal to read the real error; check the path passed to filesystem/git is valid. |
| New server not showing up in a session                 | MCP servers load at startup — restart Claude Code or run `/mcp`.                                                          |
| `node render.mjs` → "Cannot find package 'playwright'" | Run it **from inside the project** so `node_modules` resolves, and make sure `npm ci` has run.                            |
| Playwright "browser not found"                         | `npm run prepare:browsers` (or `npx playwright install --with-deps`).                                                     |
| LinkedIn MCP asks to log in again                      | `uvx mcp-server-linkedin@latest --status`; re-run `--login` if the session expired.                                       |
| `npm install -g` permission error (macOS/Linux)        | Use a Node version manager (nvm) or fix npm's global prefix; avoid `sudo`.                                                |

---

## 13. Full command cheat-sheet

```powershell
# --- Base tooling ---
npm install -g @anthropic-ai/claude-code
python -m pip install --user -U uv

# --- MCP servers (user scope; swap <PROJECT_PATH>) ---
claude mcp add playwright           --scope user -- npx -y @playwright/mcp@latest
claude mcp add filesystem           --scope user -- npx -y @modelcontextprotocol/server-filesystem "<PROJECT_PATH>"
claude mcp add git                  --scope user -- uvx mcp-server-git --repository "<PROJECT_PATH>"
claude mcp add memory               --scope user -- npx -y @modelcontextprotocol/server-memory
claude mcp add sequential-thinking  --scope user -- npx -y @modelcontextprotocol/server-sequential-thinking
claude mcp add linkedin             --scope user -- uvx mcp-server-linkedin@latest   # optional

# --- Verify ---
claude mcp list

# --- LinkedIn login (one-time) ---
uvx mcp-server-linkedin@latest --login

# --- Build & run the framework ---
npm ci
npm run prepare:browsers
npm test
npm run report:allure

# --- Generate post images ---
node render.mjs
```
