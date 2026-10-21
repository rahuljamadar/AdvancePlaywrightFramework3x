# TTACart Playwright Framework (`AdvancePlaywrightFramework3x`)

End-to-end UI test automation for **TTACart**, The Testing Academy's Playwright practice app — <https://app.thetestingacademy.com/playwright/ttacart/>

Built with **Playwright Test + TypeScript**, using the **Page Object Model** and **data-driven (JSON) test data**.

## Tech stack

| Concern | Choice |
| --- | --- |
| Test runner | `@playwright/test` 1.64 |
| Language | TypeScript (strict) |
| Test data | JSON files in `src/testdata` |
| Reporting | Custom TTA HTML reporter (`src/utils/CustomReporter.ts`) |

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm ci
npx playwright install --with-deps
```

## Running the tests

```bash
npm test                 # all configured projects
npm run test:chromium    # chromium only

npx playwright test tests/cart.spec.ts       # one spec file
npx playwright test -g "sorts the products"  # one test by title
```

Browsers run **headed** locally and **headless** when `CI` is set. Only the `chromium` project is enabled — `firefox` and `webkit` are commented out in `playwright.config.ts`.

## Project structure

```
src/
  pages/       Page objects - LoginPage, InventoryPage, CartPage
  fixtures/    step-screenshot.fixture.ts - extended `test` plus a `step` helper
  testdata/    JSON test data - login, inventory, cart
  utils/       CustomReporter - generates the TTA HTML report
tests/
  login.spec.ts       4 scenarios (data-driven)
  inventory.spec.ts   7 tests
  cart.spec.ts        8 tests (data-driven)
```

## Conventions

- **Page Object Model** — locators and actions live in `src/pages`; specs contain no selectors of their own.
- **Data-driven tests** — scenarios are iterated from JSON in `src/testdata`, so adding a case usually means adding data rather than code.
- **Stable locators** — TTACart exposes a `data-test` attribute on every element, and `testIdAttribute: 'data-test'` is set in `playwright.config.ts`, so specs resolve elements with `getByTestId`.

## Test credentials

The app is a public practice site. Valid credentials are kept in `src/testdata/login.json`:

- username: `standard_user`
- password: `tta_secret`

## Reporting

Running the suite produces a self-contained HTML report:

```
tta-report/report_<timestamp>.html   # this run
tta-report/index.html                # redirects to the latest run
tta-report/history.html              # previous runs
```

The report shows per-test status, every test step with console output, screenshots, video and trace. It opens automatically at the end of a local run — set `OPEN_CUSTOM_REPORT=false` to suppress that.

### Test artefacts

Capture is configured in `playwright.config.ts`:

- `screenshot: 'only-on-failure'`
- `video: 'retain-on-failure'`
- `trace: 'on-first-retry'`

On top of that, `src/fixtures/step-screenshot.fixture.ts` attaches a screenshot at the end of **every** `test.step`, so the report includes a walkthrough of each step. Specs import `test` from that fixture and call the `step` helper instead of `test.step`.

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `TEST_ENV` | `UAT` | Environment label shown in the report |
| `TEST_AUTHOR` | `TTA-QA` | Author column in the report |
| `OPEN_CUSTOM_REPORT` | *(opens)* | Set to `false` to stop the report opening |
| `CI` | *(unset)* | Headless, retries and a single worker when set |

A local `.env` is git-ignored; reading it is not yet wired up in `playwright.config.ts` (the `dotenv` block is commented out).

## Continuous integration

`.github/workflows/playwright.yml` runs the suite on pushes and pull requests to `main`.
