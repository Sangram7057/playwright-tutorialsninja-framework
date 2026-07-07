import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const profileDir = path.join(os.homedir(), '.linkedin-mcp', 'profile');
const out = path.resolve('linkedin-post-assets', 'drive-shots');
fs.mkdirSync(out, { recursive: true });

const ctx = await chromium.launchPersistentContext(profileDir, {
  headless: false,
  viewport: { width: 1440, height: 900 },
  args: ['--start-maximized'],
});

const page = ctx.pages()[0] || (await ctx.newPage());
await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);

const url = page.url();
const loggedIn = !/\/login|\/checkpoint|\/uas\/login|signup/.test(url);
await page.screenshot({ path: path.join(out, '01-login-state.png') });

// Try to read the member name from the top nav as a stronger signal.
let me = '';
try {
  me = await page
    .locator('.global-nav__me-photo, img.global-nav__me-photo')
    .first()
    .getAttribute('alt');
} catch {}

console.log(JSON.stringify({ url, loggedIn, me }, null, 2));

await page.waitForTimeout(2000);
await ctx.close();
