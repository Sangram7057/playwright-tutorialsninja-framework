# TutorialsNinja Automation Framework

Enterprise-grade UI automation for the [TutorialsNinja / OpenCart demo store](https://tutorialsninja.com/demo/),
built with **Playwright + TypeScript**, the **Page Object Model**, reusable
fixtures, and rich reporting.

[![Playwright Tests](https://img.shields.io/badge/tests-Playwright-2EAD33?logo=playwright)](.github/workflows/playwright.yml)

## Highlights

- **Page Object Model** with a logged, auto-waiting `BasePage` foundation.
- **Reusable components** (Header, Navigation, Footer) composed by every page.
- **Custom fixtures** inject page objects, typed JSON test data, and an
  authenticated session (per-worker storage-state reuse).
- **SOLID / DRY / Clean Architecture** — no duplicate code, no locators in tests,
  no assertions in page actions.
- **Cross-browser**: Chromium, Firefox, WebKit.
- **Reporting**: Playwright HTML + Allure (with environment & categories) + JUnit.
- **Diagnostics on failure**: screenshot, video, and trace.
- **Quality gates**: strict TypeScript, ESLint (flat config), Prettier.
- **CI**: GitHub Actions with lint gate, cross-browser matrix, caching, artifacts.

## Project structure

```
config/        Environment config, Playwright global setup
constants/     Routes, timeouts (no magic numbers)
components/    Header / Navigation / Footer (reusable UI)
pages/         BasePage, StorePage + one object per page
fixtures/      Page / test-data / auth fixtures (merged in index.ts)
utils/         Logger, random data, env info, date, data loader
helpers/       Retry, screenshot, browser/session helpers
test-data/     JSON test data
tests/
  smoke/       @smoke critical-path suite
  regression/  @regression deeper suite
reports/       Generated output (git-ignored)
```

## Getting started

```bash
# 1. Install dependencies
npm ci

# 2. Install browsers
npm run prepare:browsers

# 3. Configure environment (optional — sensible defaults are built in)
cp .env.example .env
```

## Running tests

```bash
npm test                 # full suite, all browsers
npm run test:smoke       # @smoke only
npm run test:regression  # @regression only
npm run test:chromium    # single browser
npm run test:headed      # headed mode
npm run test:ui          # Playwright UI mode
npm run test:debug       # debug mode
```

## Reports

```bash
npm run report:html      # open Playwright HTML report
npm run report:allure    # generate + open Allure report
```

See [reports/README.md](reports/README.md) for the full report layout.

## Quality

```bash
npm run typecheck        # tsc --noEmit
npm run lint             # ESLint
npm run format           # Prettier write
```

## Configuration

All runtime config is environment-driven via `config/env.config.ts` (the only
module that reads `process.env`). Key variables (see `.env.example`):

| Variable         | Default    | Purpose                   |
| ---------------- | ---------- | ------------------------- |
| `BASE_URL`       | demo store | Application under test    |
| `BROWSER`        | chromium   | Default browser           |
| `HEADLESS`       | true       | Headless toggle           |
| `ACTION_TIMEOUT` | 30000      | Per-action timeout (ms)   |
| `RETRIES`        | 0          | Local retries (CI uses 2) |
| `LOG_LEVEL`      | info       | Winston log level         |

## CI/CD

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs on
push/PR to `main`/`master`:

1. **quality** — typecheck, lint, format check.
2. **test** — cross-browser matrix (chromium/firefox/webkit) with npm + browser
   caching; uploads HTML, Allure results, JUnit and failure artifacts.
3. **allure-report** — aggregates all browsers' results into one Allure report.

## Notes on the demo target

The public demo **disables guest checkout and blocks order placement**
(`checkout/checkout` redirects to the cart). The `CheckoutPage` object and a full
guest-order test are retained for a real store; the E2E order test is marked
`test.fixme` with an explanation. See
[tests/regression/checkout.regression.spec.ts](tests/regression/checkout.regression.spec.ts).
