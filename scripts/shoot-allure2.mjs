import { chromium } from 'playwright';
import path from 'node:path';

const base = 'http://127.0.0.1:8098/index.html';
const out = path.resolve('linkedin-post-assets');
const shots = [
  { hash: '#', name: 'allure-overview-allpass' },
  { hash: '#graph', name: 'allure-graph-allpass' },
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
  console.log('wrote', s.name);
}
await browser.close();
