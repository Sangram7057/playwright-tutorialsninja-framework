import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const base = 'http://127.0.0.1:8099/index.html';
const out = path.resolve('linkedin-post-assets');
fs.mkdirSync(out, { recursive: true });

const shots = [
  { hash: '#', name: 'allure-overview' },
  { hash: '#graph', name: 'allure-graph' },
  { hash: '#suites', name: 'allure-suites' },
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
});

for (const s of shots) {
  await page.goto(base + s.hash, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(out, s.name + '.png') });
  console.log('wrote', s.name + '.png');
}

await browser.close();
