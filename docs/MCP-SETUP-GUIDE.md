# Building this framework with Claude Code + MCP — full setup guide

This guide takes you from a clean machine to a working setup where **Claude Code**
drives a set of **MCP (Model Context Protocol) servers** — Playwright, Filesystem,
Git, Memory, Sequential Thinking — to build, inspect and verify a Playwright +
TypeScript test framework. It also covers the optional **LinkedIn MCP** used for
profile/feed research.

Everything here is reproducible. Commands are shown for **Windows (PowerShell)**
with macOS/Linux notes where they differ.

---

## What is MCP (in one line)?

MCP is an open protocol that lets an AI agent _call real tools_ (browsers, the
filesystem, git, APIs) instead of only generating text. Claude Code is the MCP
**client**; each server below is a capability you plug in.

```
                 ┌──────────────────────────────┐
                 │          Claude Code           │  ← MCP client (the agent)
                 └──────────────┬─────────────────┘
        ┌────────────┬──────────┼───────────┬─────────────┐
   Playwright    Filesystem    Git       Memory     Sequential Thinking
     MCP            MCP        MCP         MCP             MCP
  (inspect app,  (read/write (commit,  (remember     (plan work in
  gen locators)   files)     review)   conventions)   ordered steps)
```

---

## 0. Prerequisites

| Tool        | Version                | Check              | Get it                                    |
| ----------- | ---------------------- | ------------------ | ----------------------------------------- |
| Node.js     | ≥ 18 (LTS recommended) | `node -v`          | <https://nodejs.org>                      |
| Python      | ≥ 3.10                 | `python --version` | <https://python.org> (tick "Add to PATH") |
| Git         | any recent             | `git --version`    | <https://git-scm.com>                     |
| Claude Code | latest                 | `claude --version` | see step 1                                |

---

## 1. Install Claude Code

```powershell
npm install -g @anthropic-ai/claude-code
claude --version
```

Then start it once in any folder and sign in:

```powershell
claude
```

> Claude Code is also available as a desktop app and IDE extension (VS Code /
> JetBrains). The MCP setup below works the same in all of them.

---

## 2. Install `uv` / `uvx` (Python tool runner)

Several MCP servers ship as Python packages run via **`uvx`** (part of Astral's
`uv`). Install it:

```powershell
python -m pip install --user -U uv
```

On Windows the executables land in
`C:\Users\<you>\AppData\Roaming\Python\Python3XX\Scripts\` — this is often **not
on PATH**. Either add that folder to your PATH, or use the full path to `uvx.exe`
in the MCP commands below.

Verify (use full path if `uvx` isn't found):

```powershell
uvx --version
# or
& "C:\Users\<you>\AppData\Roaming\Python\Python313\Scripts\uvx.exe" --version
```

> macOS/Linux: `curl -LsSf https://astral.sh/uv/install.sh | sh` puts `uvx` on PATH.

---

## 3. Register the MCP servers

MCP servers are added with `claude mcp add <name> [--scope user] -- <command...>`.
Use `--scope user` to make a server available in **every** project; omit it to
scope to the current project only.

### 3a. Playwright MCP — inspect the app, generate stable locators

```powershell
claude mcp add playwright --scope user -- npx -y @playwright/mcp@latest
```

### 3b. Filesystem MCP — create / read / update files

```powershell
claude mcp add filesystem --scope user -- npx -y @modelcontextprotocol/server-filesystem "D:\path\to\your\project"
```

The trailing path is the **root** the server may touch. Pass the directory you
want the agent to work in (or several paths).

### 3c. Git MCP — commit & review

```powershell
claude mcp add git --scope user -- uvx mcp-server-git --repository "D:\path\to\your\project"
```

### 3d. Memory MCP — remember architecture & conventions

```powershell
claude mcp add memory --scope user -- npx -y @modelcontextprotocol/server-memory
```

### 3e. Sequential Thinking MCP — break work into ordered steps

```powershell
claude mcp add sequential-thinking --scope user -- npx -y @modelcontextprotocol/server-sequential-thinking
```

> **PATH note:** if `uvx`/`npx` aren't on PATH, replace them with their full paths
> in the commands above, e.g.
> `... -- "C:\Users\<you>\AppData\Roaming\Python\Python313\Scripts\uvx.exe" mcp-server-git ...`

### Verify everything is connected

```powershell
claude mcp list
```

You want a `✓ Connected` next to each server. Restart Claude Code (or run `/mcp`
inside it) after adding servers — they load at startup.

---

## 4. Use Claude Code to build / run the framework

With the servers connected, open Claude Code **in the project folder** and let the
agent drive the tools. A good first prompt:

> "Using the Playwright MCP, open <app URL>, inspect the login page, and generate
> stable locators (data-testid → id → name → role → text → css → xpath). Put them
> in a `LoginPage` page object — no locators in the test file."

Then run the framework yourself:

```powershell
npm ci                     # install dependencies
npm run prepare:browsers   # install Playwright browsers
npm test                   # run the full suite
npm run test:smoke         # @smoke only
npm run report:allure      # open the Allure report
```

The locator priority, Page Object Model, fixtures and CI are documented in the
project [README](../README.md) and [Context.md](../Context.md).

---

## 5. Optional — LinkedIn MCP (profile / feed / messaging research)

Useful for reading profiles, companies, jobs and your feed, sending connection
requests and DMs. **Note: it is read/connect/message only — it cannot publish a
post to your feed.**

### 5a. Log in (one-time, opens a real browser)

```powershell
uvx mcp-server-linkedin@latest --login
```

Log in manually in the window that opens (it handles 2FA/captcha). Your session
is saved to `~/.linkedin-mcp/profile`. Check or clear it later with `--status` /
`--logout`.

### 5b. Register it with Claude Code

```powershell
claude mcp add linkedin --scope user -- uvx mcp-server-linkedin@latest
# (use the full path to uvx.exe if uvx is not on PATH)
```

Restart Claude Code, then `claude mcp list` should show `linkedin ✓ Connected`.

---

## 6. Posting a project write-up to LinkedIn

Because no MCP can publish to the feed, posting is a quick manual step:

1. Generate visuals — e.g. render HTML "cards" to PNG with the Playwright already
   installed in the project (see `linkedin-post-assets/`).
2. On LinkedIn → **Start a post**, paste your text, attach the images, **Post**.

---

## Troubleshooting

| Symptom                           | Fix                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `uvx`/`uv` "not recognized"       | Add `...\Python3XX\Scripts\` to PATH, or use the full `.exe` path in commands.                               |
| MCP shows `✗ Failed to connect`   | Run the command manually in a terminal to see the error; check the path passed to filesystem/git is correct. |
| New server not visible in session | MCP servers load at startup — restart Claude Code or run `/mcp`.                                             |
| LinkedIn MCP asks to log in again | `uvx mcp-server-linkedin@latest --status`; re-run `--login` if the session expired.                          |
| Playwright "browser not found"    | `npm run prepare:browsers` (or `npx playwright install --with-deps`).                                        |

---

## Quick reference — all commands

```powershell
# Tooling
npm install -g @anthropic-ai/claude-code
python -m pip install --user -U uv

# MCP servers (user scope)
claude mcp add playwright           --scope user -- npx -y @playwright/mcp@latest
claude mcp add filesystem           --scope user -- npx -y @modelcontextprotocol/server-filesystem "<PROJECT_PATH>"
claude mcp add git                  --scope user -- uvx mcp-server-git --repository "<PROJECT_PATH>"
claude mcp add memory               --scope user -- npx -y @modelcontextprotocol/server-memory
claude mcp add sequential-thinking  --scope user -- npx -y @modelcontextprotocol/server-sequential-thinking
claude mcp add linkedin             --scope user -- uvx mcp-server-linkedin@latest   # optional

# Verify
claude mcp list
```
