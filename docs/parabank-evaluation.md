# ParaBank Individual Automation Evaluation

The ParaBank suite is isolated from the existing ACME Demo App suites. It uses its own Playwright config, targets the public ParaBank application by default, and does not change `BASE_URL` or the existing Playwright projects.

## Run

```powershell
npm run test:parabank:smoke
npm run test:parabank
npm run test:parabank:parallel:headed
npm run test:parabank:android:headed:serial
```

Set `PARABANK_BASE_URL` in `.env` to point to an approved ParaBank instance. The standard suite runs serially because the default target is a shared public demo. `npm run test:parabank:parallel:headed` opens desktop Chromium and distributes test files across a maximum of two workers; scenarios within each test file remain sequential. `npm run test:parabank:matrix` runs desktop, viewport, and Android projects with the same two-worker cap. Parallel and matrix commands reject the shared public host because its rate limit can return Cloudflare error 1015. If 1015 appears, stop requests and wait for the limit to clear; do not retry in parallel. Use an approved isolated target for parallel runs. Each test process creates one uniquely named customer through the registration HTTP endpoint and uses ParaBank's bank service endpoints to look up the customer, seed a funded account, and prepare additional accounts. Transaction assertions use before/after state so cases remain repeatable despite that suite-owned account state.

To run the ParaBank UI cases on every configured Android emulator in headed Chrome, one emulator at a time, use `npm run test:parabank:android:headed:serial`. It selects only Android projects and forces one Playwright worker. Configure the serials in `PARABANK_ANDROID_DEVICE_UDIDS` or `ANDROID_DEVICE_UDIDS`. The shared public ParaBank host remains blocked for this run when its Cloudflare 1015 rate limit is active; use an approved isolated target.

The customer API setup does not use `cleanDB` or reset global demo data. The generated customer data is synthetic and test-owned. Each case uses the browser for the user-facing journey and the API for setup/reconciliation. The full suite exceeded the public demo's request allowance during validation (HTTP 429); use an approved isolated instance for full runs. The CI workflow runs only the smaller smoke pack.

Security payload cases are skipped against the shared public hostname unless explicitly enabled; a WAF challenge is not a useful application result. To enable them against an approved target, set `PARABANK_ENABLE_SECURITY_PAYLOADS=true`.

## Implemented scope and case targets

| Day | Scope | Cases |
|---|---|---:|
| 1 | Smoke, registration, and login | 8 |
| 2 | Registration validation, payload handling, session/logout | 18 |
| 3 | Account opening, account API/UI parity, balances | 15 |
| 4 | Transfers, invalid amounts, and 10-transfer reconciliation | 18 |
| 5 | Bill pay validation, amount boundaries, and 10-biller batch | 18 |
| 6 | Transaction search, date boundaries, high-volume ordering, and account reconciliation | 15 |
| 7 | Lending approval, boundary matrix, loan-account transfer, and flagship bill-pay journey | 15 |
| **Unique scenarios** | **Days 1–7 currently implemented** | **107** |

Nine API-only/high-volume cases run once in the desktop project; the remaining 98 browser UI cases also run on five mobile viewport profiles and each configured Android device. With the three default Android device entries, the expanded matrix contains up to 891 executions (107 desktop + 490 viewport + 294 Android), while remaining 107 unique scenarios. Run `npm run test:parabank:matrix`; set `PARABANK_ANDROID_DEVICE_UDIDS` (or `ANDROID_DEVICE_UDIDS`) to the connected ADB serials. This matrix uses Playwright's experimental Android support and requires Chrome and ADB on each device. Because the public demo has returned HTTP 429/Cloudflare 1015 during full-suite validation, use an approved isolated instance for full or high-volume runs.

The account-opening, repeated-transfer, bill-payment batch, and Day 7 loan-to-bill-pay flows are flagship multi-step journeys. Day 6's reusable API-backed transaction seed helper is `src/support/parabank-transaction-seeding.ts`; it is used by the volume, search, and lending journey cases and can be reused by Day 9 tests. Run each new day independently with `npm run test:parabank:day-6` and `npm run test:parabank:day-7`. Smoke tests are tagged `@smoke` and run in GitHub Actions on push and pull request. Playwright HTML output is written to `playwright-report/parabank`; Allure results are written to `allure-results/parabank`.

Two scenarios are marked as expected failures against the current public demo: blank-phone registration succeeds, and account opening succeeds from a zero-balance source. They continue to assert the requested validation behavior so they become unexpected passes if the demo fixes those gaps.

## Daily run log

Record actual execution results and time spent after each working day; do not infer time or completion from the suite's case count.

| Day | Scenarios completed | Result / blockers | Time spent |
|---|---|---|---|
| 1 | Pending run |  |  |
| 2 | Pending run |  |  |
| 3 | Pending run |  |  |
| 4 | Pending run |  |  |
| 5 | Pending run |  |  |
| 6 | Implemented; pending run on an approved target | Transaction-search suite and 55-transaction setup require a target that is not rate-limited. |  |
| 7 | Implemented; pending run on an approved target | Loan approval rules and the end-to-end loan/bill-pay journey require target verification. |  |

The currently supplied scope now implements Days 1–7. Days 8–10, the final 150–170-case target, and the final metrics report remain outside this implementation.
