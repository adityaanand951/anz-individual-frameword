# ACME Demo Automation

TypeScript scaffold for Playwright web coverage and Appium/WebdriverIO mobile smoke tests against the Applitools ACME Demo App.

## Setup

```bash
npm install
copy .env.example .env
npx playwright install
```

Set `BASE_URL`, `ANDROID_DEVICE_UDIDS`, and `ANDROID_AVD_NAMES` in `.env`. `ANDROID_DEVICE_UDIDS` must contain the exact ADB serials (for the supplied running devices: `emulator-5554,emulator-5556,emulator-5558`). `ANDROID_AVD_NAMES` is the matching display-name list (`Pixel_10_Pro_Fold,Pixel_10_Pro,Pixel_6`) and is used for readable Appium capabilities; device selection is performed by `udid`. Set `ANDROID_HOME` or `ANDROID_SDK_ROOT` to the Android SDK directory if ADB is not on `PATH`; ParaBank's Android runner adds the SDK's platform-tools and emulator directories automatically. Mobile tests require Appium 2, the UiAutomator2 driver, Chrome installed on each emulator, and three already-running Android emulators. The WebdriverIO Appium service starts and stops Appium for the test run automatically. The suite attaches to the installed Chrome browser; it does not install or launch an APK.

The separate ParaBank evaluation suite uses `PARABANK_BASE_URL` (default `https://parabank.parasoft.com/parabank/`) and does not change the ACME suite's `BASE_URL`. The standard ParaBank command runs the 107 unique Days 1–7 cases once on desktop Chrome; use `npm run test:parabank:day-6` or `npm run test:parabank:day-7` to run the new transaction-search or lending cases separately. `npm run test:parabank:parallel:headed` opens desktop Chromium and `npm run test:parabank:matrix` repeats UI cases across five mobile viewport profiles and configured Android devices. Both parallel commands are capped at two workers. Use `npm run test:parabank:android:headed:serial` to run the Android UI cases headed on each configured emulator one at a time. Nine API-only/high-volume cases run only once. Parallel and matrix commands reject the shared public demo because it is rate-limited (Cloudflare error 1015); point `PARABANK_BASE_URL` to an approved isolated instance. If the public demo is already returning 1015, stop requests and wait for its limit to clear before trying again. Configure connected device serials with `PARABANK_ANDROID_DEVICE_UDIDS` or `ANDROID_DEVICE_UDIDS`; Android runs require ADB and Chrome.

## Commands

`npm run test:web:functional`, `npm run test:web:visual`, `npm run test:web:a11y`, `npm run test:web:api`, `npm run test:web:api:parallel`, `npm run test:web:parallel:headed`, `npm run test:parabank`, `npm run test:parabank:smoke`, `npm run test:parabank:day-6`, `npm run test:parabank:day-7`, `npm run test:parabank:parallel:headed`, `npm run test:parabank:matrix`, `npm run test:parabank:android:headed:serial`, `npm run test:mobile`, `npm run test:bdd`, `npm run test:bdd:api:parallel:headed`, `npm run test:bdd:parabank`, `npm run test:bdd:mobile`, `npm run typecheck`, and `npm run report`.

Use `npm run test:web:parallel:headed` to run the web suite with visible browsers and up to six workers across the configured Playwright projects. Use `npm run test:parabank:parallel:headed` for headed ParaBank desktop execution with a maximum of two workers; only test files are distributed among workers to keep each file's stateful scenarios sequential. The ParaBank platform matrix is also capped at two workers. Run either parallel ParaBank command only against an approved isolated target. Use `npm run test:web:api:parallel` for the API-only Playwright checks; these use HTTP requests and do not open a browser. The API test set currently contains one independent test, repeated once per project. Individual steps in the Cucumber API CRUD scenario remain sequential because create, read, update, and delete depend on one another.

The Cucumber BDD scenarios in `features/login.feature` reuse the page objects through typed World hooks and step definitions. Run desktop BDD with `set HEADED=true; npm run test:bdd` in PowerShell. Use `npm run test:bdd:api:parallel:headed` to run the `@api` BDD scenarios with two parallel workers and visible Chromium windows. The Playwright `test:web:api:parallel` suite uses HTTP requests only and does not open a browser. Run the same scenarios on all configured Android emulators with `npm run test:bdd:mobile`; set `ANDROID_DEVICE_UDIDS` to target a different device set.

Allure results are written by Playwright to `allure-results/playwright` and by Cucumber to `allure-results`. Generate the combined report with `npm run report:allure:generate`, then open it with `npm run report:allure:open`, or run both commands with `npm run report:allure`. Use `npm run clean` to remove generated reports and result files.

Web projects run fully in parallel across five mobile viewports plus desktop Chromium. Visual baselines are generated with `npm run test:update-snapshots`.

## Coverage and structure

`src/pages` contains page objects, `src/support` contains data and shared helpers, `tests/web` contains functional/visual/accessibility/API specs, and `tests/mobile` contains WebdriverIO/Appium specs. The web suite is designed for functional, negative, validation, responsive, visual-regression, accessibility, API smoke/contract, and cross-project coverage. Add fixtures for test-data isolation as the application grows.

`docs/productivity.md` contains calculated monthly API/Web/Mobile targets and the tracking workflow. `docs/jira-strategy.md` defines the access probe and Jira integration guardrails. `docs/customer-strategy.md` defines the discovery strategy and complex application candidates.

`docs/parabank-evaluation.md` documents the isolated ParaBank suite and the implemented Day 1–7 coverage. The detailed ParaBank spreadsheet is `docs/parabank-test-inventory.xlsx`; regenerate it from the Markdown inventory with `npm run report:parabank:inventory`.

The mobile Appium suite uses Chrome on Android because the ACME Demo App is a web application. Set `ANDROID_DEVICE_NAMES` to the exact comma-separated names shown by `adb devices`/your emulator configuration. The three default entries are configurable examples. Ensure an Appium server is running on `APPIUM_HOST:APPIUM_PORT` and that ChromeDriver compatibility is available through Appium.
