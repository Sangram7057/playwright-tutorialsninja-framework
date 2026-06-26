/**
 * Generates a professional, company-style PDF test report from Playwright's
 * JSON results (reports/json/results.json).
 *
 * Renders a styled HTML report and prints it to PDF using Playwright's bundled
 * Chromium — no extra dependencies. Outputs:
 *   - reports/TEST-REPORT.html
 *   - reports/TEST-REPORT.pdf
 *
 * Run after a test run:  npm run report:pdf
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const JSON_PATH = resolve(process.cwd(), 'reports', 'json', 'results.json');
const OUT_DIR = resolve(process.cwd(), 'reports');
const HTML_PATH = resolve(OUT_DIR, 'TEST-REPORT.html');
const PDF_PATH = resolve(OUT_DIR, 'TEST-REPORT.pdf');

if (!existsSync(JSON_PATH)) {
  console.error(`No results at ${JSON_PATH}. Run the tests first (e.g. "npm test").`);
  process.exit(1);
}

const report = JSON.parse(readFileSync(JSON_PATH, 'utf-8'));

/** Recursively collect every spec with its owning file + project. */
function collectSpecs(suites, file, acc) {
  for (const suite of suites ?? []) {
    const currentFile = suite.file ?? file;
    for (const spec of suite.specs ?? []) {
      const test = spec.tests?.[0];
      const status = test?.status ?? (spec.ok ? 'expected' : 'unexpected');
      const duration = (test?.results ?? []).reduce((s, r) => s + (r.duration ?? 0), 0);
      acc.push({
        file: currentFile,
        title: spec.title,
        status,
        duration,
        project: test?.projectName ?? '',
      });
    }
    if (suite.suites) collectSpecs(suite.suites, currentFile, acc);
  }
  return acc;
}

const specs = collectSpecs(report.suites, undefined, []);
const stats = report.stats ?? {};
const passed = specs.filter((s) => s.status === 'expected').length;
const failed = specs.filter((s) => s.status === 'unexpected').length;
const flaky = specs.filter((s) => s.status === 'flaky').length;
const skipped = specs.filter((s) => s.status === 'skipped').length;
const total = specs.length;
const passRate = total ? Math.round(((passed + flaky) / total) * 100) : 0;
const durationSec = ((stats.duration ?? 0) / 1000).toFixed(1);
const browsers =
  [...new Set(specs.map((s) => s.project).filter(Boolean))].join(', ') || 'chromium';
const baseURL =
  report.config?.projects?.[0]?.use?.baseURL ??
  process.env.BASE_URL ??
  'https://tutorialsninja.com/demo/';
const generated = new Date().toLocaleString('en-GB', { timeZone: 'UTC' }) + ' UTC';

const STATUS_BADGE = {
  expected: '<span class="badge pass">PASS</span>',
  unexpected: '<span class="badge fail">FAIL</span>',
  flaky: '<span class="badge flaky">FLAKY</span>',
  skipped: '<span class="badge skip">SKIPPED</span>',
};

const fileGroups = new Map();
for (const spec of specs) {
  const key = (spec.file ?? 'unknown').replace(/\\/g, '/');
  if (!fileGroups.has(key)) fileGroups.set(key, []);
  fileGroups.get(key).push(spec);
}

const prettySuite = (f) =>
  f
    .replace(/^tests\//, '')
    .replace(/\.spec\.ts$/, '')
    .replace(/\.(smoke|regression)$/, ' ($1)');

let rows = '';
for (const [file, fileSpecs] of fileGroups) {
  rows += `<tr class="group"><td colspan="3">${prettySuite(file)}</td></tr>`;
  for (const s of fileSpecs) {
    rows += `<tr>
      <td class="tc">${s.title}</td>
      <td class="st">${STATUS_BADGE[s.status] ?? s.status}</td>
      <td class="du">${(s.duration / 1000).toFixed(1)}s</td>
    </tr>`;
  }
}

const overallClass = failed === 0 ? 'ok' : 'bad';
const overallText = failed === 0 ? 'ALL TESTS PASSED' : `${failed} TEST(S) FAILED`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Test Execution Report</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2933; margin: 0; font-size: 12px; }
  .page { padding: 36px 44px; }
  header { border-bottom: 4px solid #2EAD33; padding-bottom: 16px; margin-bottom: 22px; }
  header h1 { margin: 0; font-size: 24px; color: #0b3d0b; }
  header .sub { color: #52606d; margin-top: 4px; font-size: 13px; }
  .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 32px; margin: 18px 0 26px; }
  .meta div { font-size: 12px; }
  .meta b { color: #52606d; font-weight: 600; display: inline-block; min-width: 110px; }
  .banner { padding: 12px 18px; border-radius: 6px; font-weight: 700; font-size: 15px; letter-spacing: .5px; margin-bottom: 22px; }
  .banner.ok { background: #e3f9e5; color: #0b6b1e; border: 1px solid #8fd99a; }
  .banner.bad { background: #fce8e6; color: #a61b1b; border: 1px solid #e6a3a0; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
  .kpi { border: 1px solid #e4e7eb; border-radius: 8px; padding: 14px 16px; text-align: center; }
  .kpi .n { font-size: 26px; font-weight: 700; }
  .kpi .l { font-size: 11px; color: #7b8794; text-transform: uppercase; letter-spacing: .6px; margin-top: 4px; }
  .kpi.pass .n { color: #0b6b1e; }
  .kpi.fail .n { color: #a61b1b; }
  .kpi.rate .n { color: #2EAD33; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; background: #f5f7fa; color: #52606d; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; padding: 8px 10px; border-bottom: 2px solid #e4e7eb; }
  td { padding: 8px 10px; border-bottom: 1px solid #eef1f4; vertical-align: top; }
  tr.group td { background: #0b3d0b; color: #fff; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; }
  td.du { text-align: right; white-space: nowrap; color: #52606d; }
  td.st { white-space: nowrap; }
  .badge { display: inline-block; padding: 2px 9px; border-radius: 10px; font-size: 10px; font-weight: 700; letter-spacing: .5px; }
  .badge.pass { background: #e3f9e5; color: #0b6b1e; }
  .badge.fail { background: #fce8e6; color: #a61b1b; }
  .badge.flaky { background: #fff3d6; color: #946200; }
  .badge.skip { background: #eceff1; color: #607d8b; }
  footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e4e7eb; color: #9aa5b1; font-size: 10px; display: flex; justify-content: space-between; }
</style></head>
<body><div class="page">
  <header>
    <h1>Test Execution Report</h1>
    <div class="sub">TutorialsNinja Automation Framework &middot; Playwright + TypeScript</div>
  </header>

  <div class="banner ${overallClass}">${failed === 0 ? '✓' : '✕'} ${overallText} &middot; ${passRate}% pass rate</div>

  <div class="meta">
    <div><b>Generated</b> ${generated}</div>
    <div><b>Application</b> ${baseURL}</div>
    <div><b>Browser</b> ${browsers}</div>
    <div><b>Total duration</b> ${durationSec}s</div>
    <div><b>Framework</b> Playwright (Page Object Model)</div>
    <div><b>Suites</b> Smoke + Regression</div>
  </div>

  <div class="kpis">
    <div class="kpi"><div class="n">${total}</div><div class="l">Total</div></div>
    <div class="kpi pass"><div class="n">${passed + flaky}</div><div class="l">Passed</div></div>
    <div class="kpi fail"><div class="n">${failed}</div><div class="l">Failed</div></div>
    <div class="kpi rate"><div class="n">${passRate}%</div><div class="l">Pass rate</div></div>
  </div>

  <table>
    <thead><tr><th>Test Case</th><th>Status</th><th>Duration</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <footer>
    <span>TutorialsNinja Automation Framework — automated test report</span>
    <span>Generated ${generated}</span>
  </footer>
</div></body></html>`;

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(HTML_PATH, html, 'utf-8');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.pdf({
  path: PDF_PATH,
  format: 'A4',
  printBackground: true,
  margin: { top: '14mm', bottom: '14mm', left: '12mm', right: '12mm' },
});
await browser.close();

console.log(`PDF report written to ${PDF_PATH}`);
console.log(`HTML report written to ${HTML_PATH}`);
console.log(
  `Totals — total: ${total}, passed: ${passed + flaky}, failed: ${failed}, skipped: ${skipped}, pass rate: ${passRate}%`,
);
