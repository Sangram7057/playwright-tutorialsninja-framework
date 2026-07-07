import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const out = path.resolve('linkedin-post-assets', 'drive-shots');
fs.mkdirSync(out, { recursive: true });

const raw = JSON.parse(
  fs.readFileSync(path.join(os.homedir(), '.linkedin-mcp', 'cookies.json'), 'utf8'),
);
const list = Array.isArray(raw) ? raw : raw.cookies || [];
const ss = (v) => {
  const s = String(v || '').toLowerCase();
  if (s === 'strict') return 'Strict';
  if (s === 'none' || s === 'no_restriction') return 'None';
  return 'Lax';
};
const cookies = list.map((c) => ({
  name: c.name,
  value: c.value,
  domain: c.domain || '.linkedin.com',
  path: c.path || '/',
  httpOnly: !!c.httpOnly,
  secure: c.secure !== false,
  sameSite: ss(c.sameSite),
  ...(typeof c.expires === 'number' && c.expires > 0
    ? { expires: Math.floor(c.expires) }
    : {}),
}));

const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
const ctx = await browser.newContext({ viewport: null });
await ctx.addCookies(cookies);
const page = await ctx.newPage();
await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);

const url = page.url();
const loggedIn = !/\/login|\/checkpoint|\/uas\/login|signup|authwall/.test(url);
await page.screenshot({ path: path.join(out, '02-login-cookies.png') });

let me = '';
try {
  me = (await page.locator('.global-nav__me-photo').first().getAttribute('alt')) || '';
} catch {}

// Save storageState so later scripts reuse it without re-injecting.
await ctx.storageState({ path: path.resolve('linkedin-post-assets', 'li-state.json') });

console.log(JSON.stringify({ url, loggedIn, me }, null, 2));
await page.waitForTimeout(1500);
await browser.close();
