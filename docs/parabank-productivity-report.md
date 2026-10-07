# ParaBank 10-Day Individual Productivity Report

## Scope and status

The supplied day-level case targets sum to 142-144 cases (Days 1-9); the separate overall goal asks for 150-170. The implemented Days 1-9 suite contains 144 unique cases. Day 10 adds no cases. This mismatch is recorded rather than padded with unrequested scenarios.

| Measure | Verified value |
|---|---|
| Unique automated cases, Days 1-9 | 144 |
| Completed scope days | 10 of 10 |
| Full-suite stability repetitions | 3 of 3 |
| Flaky test count | 0 |
| Approved test target | Local isolated ParaBank at `http://127.0.0.1:8080/parabank/` |
| CI run link | Not applicable; acceptance ran locally |
| Total implementation hours | Not recorded |

## Day 10 stability evidence

Run `npm run test:parabank:day-10` with `PARABANK_BASE_URL` set to an approved isolated instance. The command requires three consecutive full-suite runs and writes per-run JSON, `summary.json`, and a consolidated HTML report under `test-results/parabank-day-10`. Passing tests, expected failures, unexpected failures, skips, and flakes are counted separately.

| Run | Passed | Failed | Expected failures | Skipped | Flaky | Duration |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 133 | 0 | 11 | 0 | 0 | 357.3s |
| 2 | 133 | 0 | 11 | 0 | 0 | 342.1s |
| 3 | 133 | 0 | 11 | 0 | 0 | 219.9s |

Each run exercised all 144 cases. The 11 expected failures are retained validation assertions for observed application gaps; they are not counted as passing cases or unexpected test failures. Across three runs: 399 passes, 33 expected failures, 0 unexpected failures, 0 skipped, and 0 flaky executions.

## Headed verification

| Suite | Headed result |
|---|---|
| ParaBank desktop suite (Days 1-9, Chromium) | 144 cases passed; includes 11 expected application-gap failures |
| Day 9 Chromium + 390x844 mobile viewport | 30/30 passed |
| Day 9 Firefox (isolated project run) | 15/15 passed |
| REST/SOAP API-only suite | 22/22 passed; browser visibility is not applicable |
| ParaBank Gherkin feature | 4/4 scenarios, 29/29 steps passed in headed Chromium |

The first combined headed Day 9 project run had Firefox UI action timeouts after switching from Chromium. The Firefox project passed 15/15 when run separately; the Chromium and mobile-viewport projects passed 30/30 in the combined run. The headed desktop run also exposed browser back-forward-cache restoration after logout. The test now reloads the restored page and verifies the logged-out session redirects to login; the focused headed test and full headed suite passed.

## Defect observations

These are observed ParaBank application behaviors, not defects filed against the project:

| Observation | Evidence | Defect filed |
|---|---|---|
| Blank phone number accepted during registration | Day 2 expected-failure test | No |
| Account opening accepted with a zero-balance funding account | Day 3 expected-failure test | No |
| Invalid and same-account transfer inputs reported as completed | Day 4 expected-failure tests | No |
| Negative and overdrawn bill payments changed account balance | Day 5 expected-failure tests | No |
| Activity API/UI ordering is oldest-first rather than the requested newest-first | Day 6 high-volume expected-failure test and source ordering | No |
| Critical accessibility violations are present on scanned pages | Day 9 axe-core JSON attachments | No |

## Self-assessment

Complete this section based on actual tracked time and successful run data. No productivity rate, pass-rate claim, defect-fix rate, or time-spent figure has been inferred.

| Metric | Value |
|---|---|
| Planned scope days completed | 10 of 10 |
| Total hours spent | Pending |
| Unique cases implemented | 144 |
| Unique cases passing per final acceptance run | 133 |
| Cases per planned scope day | 14.4 (144 / 10) |
| Flaky tests after hardening | 0 |
| Key learning / improvement | Per-test customer data and awaited server responses prevent cross-test state leakage and incomplete rapid-transfer reconciliation. |

## Walkthrough

Walkthrough/demo status and recording link: Not recorded. The Day 7 loan-to-bill-pay flagship journey passed in the final suite runs.
