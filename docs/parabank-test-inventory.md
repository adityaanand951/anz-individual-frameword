# ParaBank Test Case Inventory

The formatted Excel workbook is [parabank-test-inventory.xlsx](./parabank-test-inventory.xlsx). Regenerate it after editing this inventory with `npm run report:parabank:inventory`.

The supplied plan covers Days 1-5. The automated suite contains 77 unique cases: Day 1 (8), Day 2 (18), Day 3 (15), Day 4 (18), and Day 5 (18).

Platform-aware counts keep unique scenarios separate from executions. Six API-only cases (TC-ACC-001, TC-ACC-012–015, and TC-TRF-018) run once in the desktop project. The other 71 cases include browser UI coverage (with API setup/reconciliation where applicable) and run on desktop, five mobile viewport profiles, and each configured Android device. With the three default Android device entries, that is 77 + (71 × 5) + (71 × 3) = 645 project executions, not 645 unique cases. Use `npm run test:parabank:matrix` to run the expanded matrix; it requires connected Android devices and is best run against an approved isolated ParaBank instance.

All cases below have automation code. "Day Completed" is left as Pending because execution of the full suite has not been completed; the public demo returned HTTP 429 during the full run. See Notes for the observed public-demo limitations. A test marked expected failure checks a validation gap in the public demo and should become an unexpected pass if the behavior is fixed.

| Test Case ID | Module | Scenario Description | Test Type | Priority | Complexity | Day Assigned | Day Completed | Automation Status | Execution Result | Reusable Component (Y/N) | Defect Raised (Y/N) | Defect ID / Link | Notes |
|---|---|---|---|---|---|---:|---|---|---|:---:|:---:|---|---|
| TC-AUT-001 | Authentication | Login page displays the username and password controls. | Smoke | High | Low | 1 | Pending | Automated | Not fully verified | Y | N | - | Smoke tagged |
| TC-AUT-002 | Authentication | API-seeded customer logs in and reaches account services. | Positive | High | Medium | 1 | Pending | Automated | Not fully verified | Y | N | - | Smoke tagged; API-seeded |
| TC-AUT-003 | Authentication | Reject login with an unknown username. | Negative | High | Low | 1 | Pending | Automated | Not fully verified | Y | N | - | Smoke tagged |
| TC-AUT-004 | Authentication | Reject login with an incorrect password. | Negative | High | Low | 1 | Pending | Automated | Not fully verified | Y | N | - | Smoke tagged |
| TC-AUT-005 | Authentication | Reject login with a blank username. | Negative | High | Low | 1 | Pending | Automated | Not fully verified | Y | N | - | Smoke tagged |
| TC-AUT-006 | Authentication | Reject login with a blank password. | Negative | High | Low | 1 | Pending | Automated | Not fully verified | Y | N | - | Smoke tagged |
| TC-REG-001 | Registration | Registration form exposes all onboarding fields. | Smoke | High | Low | 1 | Pending | Automated | Not fully verified | Y | N | - | Smoke tagged |
| TC-REG-002 | Registration | Register a new customer, confirm automatic sign-in, and verify the default account and balance. | E2E | High | Medium | 1 | Pending | Automated | Not fully verified | Y | N | - | Smoke tagged; API/UI parity |
| TC-REG-003 | Registration | Reject registration when first name is blank. | Negative | High | Low | 2 | Pending | Automated | Not fully verified | Y | N | - | Data-driven mandatory field |
| TC-REG-004 | Registration | Reject registration when last name is blank. | Negative | High | Low | 2 | Pending | Automated | Not fully verified | Y | N | - | Data-driven mandatory field |
| TC-REG-005 | Registration | Reject registration when street address is blank. | Negative | High | Low | 2 | Pending | Automated | Not fully verified | Y | N | - | Data-driven mandatory field |
| TC-REG-006 | Registration | Reject registration when city is blank. | Negative | High | Low | 2 | Pending | Automated | Not fully verified | Y | N | - | Data-driven mandatory field |
| TC-REG-007 | Registration | Reject registration when state is blank. | Negative | High | Low | 2 | Pending | Automated | Not fully verified | Y | N | - | Data-driven mandatory field |
| TC-REG-008 | Registration | Reject registration when ZIP/postcode is blank. | Negative | High | Low | 2 | Pending | Automated | Not fully verified | Y | N | - | Data-driven mandatory field |
| TC-REG-009 | Registration | Reject registration when phone number is blank. | Negative | High | Low | 2 | Pending | Automated | Not fully verified | Y | N | - | Expected failure: public demo accepted blank phone number |
| TC-REG-010 | Registration | Reject registration when SSN is blank. | Negative | High | Low | 2 | Pending | Automated | Not fully verified | Y | N | - | Data-driven mandatory field |
| TC-REG-011 | Registration | Reject registration when username is blank. | Negative | High | Low | 2 | Pending | Automated | Not fully verified | Y | N | - | Data-driven mandatory field |
| TC-REG-012 | Registration | Reject registration when password is blank. | Negative | High | Low | 2 | Pending | Automated | Not fully verified | Y | N | - | Data-driven mandatory field |
| TC-REG-013 | Registration | Reject a duplicate username. | Negative | High | Medium | 2 | Pending | Automated | Not fully verified | Y | N | - | Uses API-seeded customer |
| TC-REG-014 | Registration | Reject mismatched password and confirmation values. | Negative | High | Low | 2 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-REG-015 | Registration | Handle a 256-character first name without an application error. | Boundary | Medium | Medium | 2 | Pending | Automated | Not fully verified | Y | N | - | Security payload probes are opt-in on shared demo |
| TC-REG-016 | Registration | Handle special characters in first name without an application error. | Security | Medium | Medium | 2 | Pending | Automated | Not fully verified | Y | N | - | Security payload probes are opt-in on shared demo |
| TC-REG-017 | Registration | Handle SQL-injection-shaped first-name input without an application error. | Security | High | Medium | 2 | Pending | Automated | Not fully verified | Y | N | - | Security payload probes are opt-in on shared demo |
| TC-REG-018 | Registration | Handle XSS-shaped first-name input without script execution. | Security | High | Medium | 2 | Pending | Automated | Not fully verified | Y | N | - | Security payload probes are opt-in on shared demo |
| TC-SES-001 | Session | After logout, browser Back must not expose the authenticated overview. | Session | High | Medium | 2 | Pending | Automated | Not fully verified | Y | N | - | Checks authenticated content is hidden |
| TC-SES-002 | Session | Direct navigation to overview after logout returns the user to login. | Session | High | Medium | 2 | Pending | Automated | Not fully verified | Y | N | - | Checks login view and absence of account data |
| TC-ACC-001 | Accounts | Newly registered customer has a default account in the Accounts API. | API | High | Low | 3 | Pending | Automated | Not fully verified | Y | N | - | API-seeded customer |
| TC-ACC-002 | Accounts | Open a CHECKING account and verify its account ID and type through the API. | Functional | High | Medium | 3 | Pending | Automated | Not fully verified | Y | N | - | API-funded source account |
| TC-ACC-003 | Accounts | Open a SAVINGS account and verify its account ID and type through the API. | Functional | High | Medium | 3 | Pending | Automated | Not fully verified | Y | N | - | API-funded source account |
| TC-ACC-004 | Accounts | Reject account opening when the funding account has insufficient funds. | Negative | High | Medium | 3 | Pending | Automated | Not fully verified | Y | N | - | Expected failure: public demo opened an account from a zero-balance source |
| TC-ACC-005 | Accounts | Open five accounts sequentially and reconcile account inventory and total balance. | E2E | High | High | 3 | Pending | Automated | Not fully verified | Y | N | - | Multi-step flagship journey |
| TC-ACC-006 | Accounts | Verify Accounts Overview account ID and balance against the Accounts API. | API/UI parity | High | Medium | 3 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-ACC-007 | Accounts | Verify one API-created account is listed in Accounts Overview. | Functional | Medium | Low | 3 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-ACC-008 | Accounts | Verify two API-created accounts are listed in Accounts Overview. | Functional | Medium | Low | 3 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-ACC-009 | Accounts | Verify three API-created accounts are listed in Accounts Overview. | Functional | Medium | Low | 3 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-ACC-010 | Accounts | Verify four API-created accounts are listed in Accounts Overview. | Functional | Medium | Low | 3 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-ACC-011 | Accounts | Verify five API-created accounts are listed in Accounts Overview. | Functional | Medium | Medium | 3 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-ACC-012 | Accounts | Create a CHECKING account through the API and verify the returned ID. | API | Medium | Low | 3 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-ACC-013 | Accounts | Create a SAVINGS account through the API and verify the returned ID. | API | Medium | Low | 3 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-ACC-014 | Accounts | Verify account balances are finite values with penny precision. | Data validation | Medium | Low | 3 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-ACC-015 | Accounts | Retrieve transaction history for a customer account through the API. | API | Medium | Low | 3 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-001 | Transfers | Transfer between own accounts and reconcile source debit and destination credit. | Functional | High | Medium | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-002 | Transfers | Transfer the full available source balance and verify it reaches zero. | Boundary | High | Medium | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-003 | Transfers | Reject a transfer amount greater than the available balance. | Negative | High | Medium | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-004 | Transfers | Reject a negative transfer amount. | Negative | High | Low | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-005 | Transfers | Reject a zero transfer amount. | Boundary | High | Low | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-006 | Transfers | Reject a non-numeric transfer amount. | Negative | High | Low | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-007 | Transfers | Reject a transfer amount with more than two decimal places. | Boundary | Medium | Low | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-008 | Transfers | Reject a transfer from an account to itself. | Negative | High | Medium | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-009 | Transfers | Perform ten rapid transfers and reconcile balances and debit/credit ledger counts. | E2E | High | High | 4 | Pending | Automated | Not fully verified | Y | N | - | Multi-step flagship journey |
| TC-TRF-010 | Transfers | Accept a transfer of the minimum positive currency value, 0.01. | Boundary | Medium | Low | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-011 | Transfers | Accept a whole-dollar transfer amount. | Functional | Medium | Low | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-012 | Transfers | Accept a transfer amount with one decimal place. | Functional | Medium | Low | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-013 | Transfers | Accept a transfer amount with two decimal places. | Functional | Medium | Low | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-014 | Transfers | Accept a 25.00 transfer when the source has sufficient funds. | Functional | Medium | Low | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-015 | Transfers | Transfer from a CHECKING account to a SAVINGS account. | Functional | Medium | Medium | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-016 | Transfers | Transfer from a SAVINGS account to a CHECKING account. | Functional | Medium | Medium | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-017 | Transfers | Transfer between two CHECKING accounts. | Functional | Medium | Medium | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TRF-018 | Transfers | API rejects a transfer to an unknown destination account. | API negative | High | Medium | 4 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-001 | Bill Pay | Pay a biller and verify confirmation and matching source-account debit. | E2E | High | Medium | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-002 | Bill Pay | Reject bill payment when payee name is blank. | Negative | High | Low | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-003 | Bill Pay | Reject bill payment when payee street address is blank. | Negative | High | Low | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-004 | Bill Pay | Reject bill payment when payee city is blank. | Negative | High | Low | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-005 | Bill Pay | Reject bill payment when payee state is blank. | Negative | High | Low | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-006 | Bill Pay | Reject bill payment when payee ZIP/postcode is blank. | Negative | High | Low | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-007 | Bill Pay | Reject bill payment when payee phone number is blank. | Negative | High | Low | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-008 | Bill Pay | Reject bill payment when payee account number is blank. | Negative | High | Low | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-009 | Bill Pay | Reject bill payment when account-number confirmation is blank. | Negative | High | Low | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-010 | Bill Pay | Reject bill payment when amount is blank. | Negative | High | Low | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-011 | Bill Pay | Reject bill payment when account and verification account numbers do not match. | Negative | High | Medium | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-012 | Bill Pay | Accept bill payment for the minimum positive amount, 0.01. | Boundary | Medium | Low | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-013 | Bill Pay | Reject a zero-amount bill payment. | Boundary | High | Low | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-014 | Bill Pay | Reject a bill payment with a blank amount. | Negative | High | Low | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-015 | Bill Pay | Reject a negative bill payment amount. | Negative | High | Low | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-016 | Bill Pay | Reject bill payment exceeding the available balance. | Negative | High | Medium | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-017 | Bill Pay | Pay the same biller twice and verify two separate debits. | Functional | High | Medium | 5 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-BPY-018 | Bill Pay | Pay ten billers from JSON data and reconcile total debits and transactions. | E2E | High | High | 5 | Pending | Automated | Not fully verified | Y | N | - | Multi-step flagship journey |
