/**
 * Generates a Markdown test-summary report (TEST-SUMMARY.md) from Playwright's
 * JSON results (reports/json/results.json).
 *
 * Run after a test run:  npm run report:summary
 *
 * Why: a concise, committable, human-readable snapshot of the latest run —
 * totals, per-suite breakdown and pass/fail status — without needing to serve
 * the HTML/Allure report.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const JSON_PATH = resolve(process.cwd(), 'reports', 'json', 'results.json');
const OUT_PATH = resolve(process.cwd(), 'TEST-SUMMARY.md');

if (!existsSync(JSON_PATH)) {
  console.error(
    `No results found at ${JSON_PATH}. Run the tests first (e.g. "npm test").`,
  );
  process.exit(1);
}

const report = JSON.parse(readFileSync(JSON_PATH, 'utf-8'));

/** Status → emoji for the table. */
const ICON = {
  expected: '✅ Passed',
  passed: '✅ Passed',
  unexpected: '❌ Failed',
  failed: '❌ Failed',
  flaky: '⚠️ Flaky (passed on retry)',
  skipped: '⏭️ Skipped',
};

/** Recursively collect every spec with its owning file. */
function collectSpecs(suites, file, acc) {
  for (const suite of suites ?? []) {
    const currentFile = suite.file ?? file;
    for (const spec of suite.specs ?? []) {
      const test = spec.tests?.[0];
      const status = test?.status ?? (spec.ok ? 'expected' : 'unexpected');
      const duration = (test?.results ?? []).reduce(
        (sum, r) => sum + (r.duration ?? 0),
        0,
      );
      const project = test?.projectName ?? '';
      acc.push({ file: currentFile, title: spec.title, status, duration, project });
    }
    if (suite.suites) collectSpecs(suite.suites, currentFile, acc);
  }
  return acc;
}

const specs = collectSpecs(report.suites, undefined, []);

const stats = report.stats ?? {};
const passed = stats.expected ?? specs.filter((s) => s.status === 'expected').length;
const failed = stats.unexpected ?? specs.filter((s) => s.status === 'unexpected').length;
const flaky = stats.flaky ?? specs.filter((s) => s.status === 'flaky').length;
const skipped = stats.skipped ?? specs.filter((s) => s.status === 'skipped').length;
const total = specs.length;
const durationSec = ((stats.duration ?? 0) / 1000).toFixed(1);

// Browsers that actually ran (from the results), not just those configured.
const browsers =
  [...new Set(specs.map((s) => s.project).filter(Boolean))].join(', ') || 'chromium';
const baseURL =
  report.config?.projects?.[0]?.use?.baseURL ??
  process.env.BASE_URL ??
  'https://tutorialsninja.com/demo/';

const allPassed = failed === 0;
const headline = allPassed
  ? '## ✅ Result: ALL TESTS PASSED'
  : `## ❌ Result: ${failed} FAILED`;

// Group specs by file for a readable breakdown.
const byFile = new Map();
for (const spec of specs) {
  const key = (spec.file ?? 'unknown').replace(/\\/g, '/');
  if (!byFile.has(key)) byFile.set(key, []);
  byFile.get(key).push(spec);
}

let md = `# Test Summary Report\n\n`;
md += `${headline}\n\n`;
md += `- **Generated:** ${new Date().toISOString()}\n`;
md += `- **Application:** ${baseURL}\n`;
md += `- **Browser(s):** ${browsers || 'chromium'}\n`;
md += `- **Duration:** ${durationSec}s\n\n`;

md += `## Totals\n\n`;
md += `| Total | ✅ Passed | ❌ Failed | ⚠️ Flaky | ⏭️ Skipped |\n`;
md += `| ----- | --------- | --------- | -------- | ---------- |\n`;
md += `| ${total} | ${passed} | ${failed} | ${flaky} | ${skipped} |\n\n`;

md += `## Details\n\n`;
for (const [file, fileSpecs] of byFile) {
  md += `### \`${file}\`\n\n`;
  md += `| Test | Status | Duration |\n`;
  md += `| ---- | ------ | -------- |\n`;
  for (const spec of fileSpecs) {
    const icon = ICON[spec.status] ?? spec.status;
    md += `| ${spec.title} | ${icon} | ${(spec.duration / 1000).toFixed(1)}s |\n`;
  }
  md += `\n`;
}

md += `---\n\n`;
md += `_Note: skipped entries are intentionally gated (e.g. the full order-placement E2E runs only against an instance with guest checkout enabled — see docs/local-opencart.md)._\n`;

writeFileSync(OUT_PATH, md, 'utf-8');
console.log(`Test summary written to ${OUT_PATH}`);
console.log(
  `Totals — total: ${total}, passed: ${passed}, failed: ${failed}, flaky: ${flaky}, skipped: ${skipped}`,
);
