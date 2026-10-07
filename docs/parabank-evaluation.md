# ParaBank Individual Automation Evaluation

The ParaBank suite is isolated from the existing ACME Demo App suites. It uses its own Playwright config and does not change `BASE_URL` or the existing Playwright projects. This workspace is configured to use the local isolated ParaBank instance at `http://127.0.0.1:8080/parabank/`; it is built from the official ParaBank source and does not depend on the shared public demo.

## Run

```powershell
npm run setup:parabank:local
npm run test:parabank:smoke
npm run test:parabank
npm run test:parabank:parallel:headed
npm run test:parabank:android:headed:serial
```

`npm run setup:parabank:local` provisions a user-local JDK 21, Maven, Tomcat 11, checks out a pinned official ParaBank revision, builds its WAR, and starts it at the local URL. It does not install system-wide software. Use `npm run stop:parabank:local` to stop Tomcat when finished. The local app uses its own HyperSQL and ActiveMQ instances; its data is private to the local installation. `PARABANK_BASE_URL` can be overridden for a different approved instance. Test processes create uniquely named synthetic customers and do not reset the database. `npm run test:parabank:parallel:headed` opens desktop Chromium and distributes test files across a maximum of two workers; scenarios within each test file remain sequential. `npm run test:parabank:matrix` runs desktop, viewport, and Android projects with the same two-worker cap.

To run the ParaBank UI cases on every configured Android emulator in headed Chrome, one emulator at a time, use `npm run test:parabank:android:headed:serial`. It selects only Android projects and forces one Playwright worker. Configure the serials in `PARABANK_ANDROID_DEVICE_UDIDS` or `ANDROID_DEVICE_UDIDS`. The shared public ParaBank host remains blocked for this run when its Cloudflare 1015 rate limit is active; use an approved isolated target.

The customer API setup does not use `cleanDB` or reset global demo data. The generated customer data is synthetic and test-owned. Each case uses the browser for the user-facing journey and the API for setup/reconciliation. The full suite exceeded the public demo's request allowance during validation (HTTP 429). After the first detected rate limit, remaining API-backed cases are now skipped to avoid repeated requests and misleading setup failures. Use an approved isolated instance for full runs. The CI workflow runs only the smaller smoke pack.

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
| 8 | REST API positive/negative/schema coverage, SOAP parity, and API-only E2E | 22 |
| 9 | Browser/mobile smoke, accessibility scans, and mocked PayID/NPP outcomes | 15 |
| 10 | Stabilisation, three-run hardening, and metrics reporting | 0 |
| **Unique scenarios** | **Days 1–9 implemented** | **144** |

The Day 8 API-only suite runs independently with `npm run test:parabank:day-8-api`. Day 9 has a separate Chromium, Firefox, and 390x844 mobile viewport config and runs with `npm run test:parabank:day-9`. `npm run test:parabank:day-9:mock` runs only the three route-mocked PayID outcomes in Chromium and requires no ParaBank server. The 144 unique Day 1-9 cases are six short of the overall 150-170 target in the original brief: its individual day targets sum to only 142-144, so this implementation honors the stated per-day scope rather than inventing more cases. Day 10 adds no scenarios.

The account-opening, repeated-transfer, bill-payment batch, Day 7 loan-to-bill-pay, and Day 8 pure API flows are flagship multi-step journeys. Day 6's reusable API-backed transaction seed helper is `src/support/parabank-transaction-seeding.ts`; it is reused by Day 7 and available for later API scenarios. Day 9 attaches axe-core violation JSON to results and records violation counts in test annotations; accessibility findings are reported rather than hidden behind a failing scan. The PayID/NPP work is a mock simulation because ParaBank has no native PayID integration. Day 10 uses `npm run test:parabank:day-10` and runs the complete suite three times, storing per-run JSON and an aggregate HTML summary in `test-results/parabank-day-10`. The report separates passing tests from expected failures, unexpected failures, and flaky results.

The Days 1-7 cross-platform matrix still requires connected Android devices and is best run against an approved isolated target. The public demo has returned HTTP 429/Cloudflare 1015 during full-suite runs; the suite stops/skips after the first detected throttle to avoid generating misleading cascades.

Observed ParaBank behavior gaps remain explicit expected failures: registration without a phone number, account opening from a zero-balance source, invalid/self-directed transfers, negative and overdrawn bill payments, and oldest-first account activity ordering where newest-first is required. These tests retain the requested assertions and become unexpected passes if the application behavior changes. Accessibility findings are included in the Day 9 attachments. Transfer balance reconciliation waits for each server response and verifies the resulting API balance.

## Daily run log

Record actual execution results and time spent after each working day; do not infer time or completion from the suite's case count.

| Day | Scenarios completed | Result / blockers | Time spent |
|---|---|---|---|
| 1 | Implemented and verified in the three Day 10 runs | Registration, authentication, and overview checks passed. |  |
| 2 | Implemented and verified in the three Day 10 runs | Registration/security cases passed; blank-phone validation is a documented expected failure. |  |
| 3 | Implemented and verified in the three Day 10 runs | Account opening and balance reconciliation passed; zero-balance opening is a documented expected failure. |  |
| 4 | Implemented and verified in the three Day 10 runs | Transfers and 10-transfer ledger reconciliation passed; six invalid/self-transfer checks remain expected failures. |  |
| 5 | Implemented and verified in the three Day 10 runs | Bill-pay validation and 10-biller reconciliation passed; negative/overdraw cases remain expected failures. |  |
| 6 | Implemented and verified | Transaction search, 55-transaction history, and three-account API/UI reconciliation passed; newest-first expectation is an observed application gap. |  |
| 7 | Implemented and verified | Loan matrix, loan-account transfer, and flagship loan-to-bill-pay journey passed. |  |
| 8 | Implemented and verified | 22 REST/SOAP API tests passed independently. |  |
| 9 | Implemented and verified | Chromium, Firefox, and 390x844 suites passed (45 runs); accessibility violations are attached to reports; PayID is mocked. |  |
| 10 | Completed | Three complete suite runs: 133 passed, 11 expected application-gap failures, 0 unexpected failures, 0 flaky. |  |

The brief's 150-170 target does not match its daily targets; current Days 1-9 scope totals 144 unique automated cases. Add at least six agreed cases if the 150 minimum is strict. The CI workflow runs the mocked PayID suite without ParaBank; it runs the full Day 9 cross-browser suite only when the `PARABANK_BASE_URL` repository variable points at an approved isolated instance. Execution metrics are recorded in `docs/parabank-productivity-report.md`; tracked implementation hours and a CI link were not available.
