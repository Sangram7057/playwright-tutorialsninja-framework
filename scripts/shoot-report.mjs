import { chromium } from 'playwright';
import path from 'node:path';
import url from 'node:url';
const out = path.resolve('linkedin-post-assets');
const htmlPath = path.resolve('reports', 'TEST-REPORT.html');
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1240, height: 1600 },
  deviceScaleFactor: 2,
});
await page.goto(url.pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(out, 'pdf-report-full.png'), fullPage: true });
await page.screenshot({ path: path.join(out, 'pdf-report-top.png') });
const txt = await page.evaluate(() => document.body.innerText.slice(0, 400));
console.log(txt);
await browser.close();
