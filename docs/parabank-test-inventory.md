# ParaBank Test Case Inventory

The formatted Excel workbook is [parabank-test-inventory.xlsx](./parabank-test-inventory.xlsx). Regenerate it after editing this inventory with `npm run report:parabank:inventory`.

The automated inventory contains 144 unique cases across Days 1-9. Day 1-5 are the original supplied plan (77 cases); Days 6-9 add transaction search (15), lending (15), API (22), and cross-channel (15) coverage. Day 10 is a hardening day and adds no cases.

Platform-aware counts keep unique scenarios separate from executions. The six API-only cases from Days 1-5, all 22 Day 8 API cases, and three high-volume Day 6 cases run once. Day 9's 15 channel cases run in Chromium, Firefox, and a 390×844 mobile viewport; other UI cases run once in desktop Chromium. This results in 174 project executions (144 unique scenarios plus two additional Day 9 project executions per case).

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
| TC-TXN-001 | Transactions | Find a transaction by transaction ID. | Positive | High | Low | 6 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TXN-002 | Transactions | Find transactions by transaction date. | Positive | High | Low | 6 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TXN-003 | Transactions | Find transactions within an inclusive date range. | Positive | High | Medium | 6 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TXN-004 | Transactions | Find a transaction by exact amount. | Positive | High | Low | 6 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TXN-005 | Transactions | Handle a date range whose start and end dates are equal. | Boundary | Medium | Low | 6 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TXN-006 | Transactions | Handle a date range whose end date is earlier than its start date. | Negative | High | Low | 6 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TXN-007 | Transactions | Handle an invalid date format in a date-range search. | Negative | High | Low | 6 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TXN-008 | Transactions | Handle a future date in a date-range search. | Boundary | Medium | Low | 6 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TXN-009 | Transactions | Show an empty state when amount search has no matching transaction. | Negative | Medium | Low | 6 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TXN-010 | Transactions | Seed 55 transactions and find the newest transaction through UI search. | Volume | High | High | 6 | Pending | Automated | Not fully verified | Y | N | - | API-only high-volume setup |
| TC-TXN-011 | Transactions | Show the seeded transaction volume in account activity without losing rows. | Volume | High | High | 6 | Pending | Automated | Not fully verified | Y | N | - | API-only high-volume setup |
| TC-TXN-012 | Transactions | List the newest seeded transaction first in high-volume account activity. | Volume | High | High | 6 | Pending | Automated | Not fully verified | Y | N | - | API-only high-volume setup |
| TC-TXN-013 | Transactions | Reconcile account activity against the API for funded account 1. | Reconciliation | High | Medium | 6 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TXN-014 | Transactions | Reconcile account activity against the API for funded account 2. | Reconciliation | High | Medium | 6 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-TXN-015 | Transactions | Reconcile account activity against the API for funded account 3. | Reconciliation | High | Medium | 6 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-001 | Lending | Approve a valid loan and show the new loan account in overview. | Positive | High | High | 7 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-002 | Lending | Deny a loan when down payment exceeds available source funds. | Negative | High | Medium | 7 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-003 | Lending | Handle a loan application with zero loan amount. | Boundary | High | Low | 7 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-004 | Lending | Handle a loan application with negative loan amount. | Negative | High | Low | 7 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-005 | Lending | Handle a loan application with blank down payment. | Negative | High | Low | 7 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-006 | Lending | Handle a loan application with non-numeric down payment. | Negative | High | Low | 7 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-007 | Lending | Handle a down payment equal to the loan amount. | Boundary | Medium | Medium | 7 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-008 | Lending | Check loan approval-matrix combination 1. | Decision matrix | High | Medium | 7 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-009 | Lending | Check loan approval-matrix combination 2. | Decision matrix | High | Medium | 7 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-010 | Lending | Check loan approval-matrix combination 3. | Decision matrix | High | Medium | 7 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-011 | Lending | Check loan approval-matrix combination 4. | Decision matrix | High | Medium | 7 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-012 | Lending | Check loan approval-matrix combination 5. | Decision matrix | High | Medium | 7 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-013 | Lending | Transfer funds out of an approved loan account. | Functional | High | Medium | 7 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-014 | Lending | Show the approved loan account in Accounts Overview. | Functional | High | Medium | 7 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-LND-015 | Lending | Register, fund savings, obtain an approved loan, pay a bill, and reconcile the complete ledger. | E2E | High | High | 7 | Pending | Automated | Not fully verified | Y | N | - | Flagship journey |
| TC-API-001 | API | Create and retrieve a customer through the REST customer resource. | Positive | High | Medium | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-002 | API | Retrieve the registered customer's seed-account collection. | Positive | High | Low | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-003 | API | Open a checking account through the REST API. | Positive | High | Medium | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-004 | API | Open a savings account through the REST API. | Positive | High | Medium | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-005 | API | Retrieve account details through the REST API. | Positive | High | Low | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-006 | API | Deposit funds and find the resulting transaction. | Positive | High | Medium | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-007 | API | Retrieve transaction identifiers and amounts. | Positive | High | Low | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-008 | API | Transfer funds and verify source debit and destination credit. | Positive | High | Medium | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-009 | API | Pay a bill and verify the debit and recorded transaction. | Positive | High | Medium | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-010 | API | Return no customer record for an unknown customer ID. | Negative | High | Low | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-011 | API | Return no account record for an unknown account ID. | Negative | High | Low | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-012 | API | Return no transaction record for an unknown account ID. | Negative | High | Low | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-013 | API | Reject a transfer with missing required parameters. | Negative | High | Low | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-014 | API | Reject a bill payment with missing required parameters. | Negative | High | Low | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-015 | API | Reject JSON transfer content without mutating either account balance. | Negative | High | Medium | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-016 | API | Validate required customer fields in the REST XML response. | Contract | High | Medium | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-017 | API | Validate account fields and balance in the REST XML response. | Contract | High | Medium | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-018 | API | Validate transaction fields in the REST XML response. | Contract | High | Medium | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-019 | API | Match SOAP customer lookup with the REST customer record. | Parity | High | Medium | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-020 | API | Match SOAP account lookup with the REST account record. | Parity | High | Medium | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-021 | API | Verify SOAP transaction lookup returns REST transaction identifiers. | Parity | High | Medium | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only |
| TC-API-022 | API | Create customer, account, transfer, bill payment, and reconcile ledger using only APIs. | E2E | High | High | 8 | Pending | Automated | Not fully verified | Y | N | - | API-only flagship |
| TC-CHN-001 | Channels | Log in successfully in Chromium. | Cross-browser | High | Medium | 9 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-CHN-002 | Channels | Display Accounts Overview in Chromium. | Cross-browser | High | Medium | 9 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-CHN-003 | Channels | Transfer between own accounts in Chromium. | Cross-browser | High | Medium | 9 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-CHN-004 | Channels | Pay a bill in Chromium. | Cross-browser | High | Medium | 9 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-CHN-005 | Channels | Hide authenticated account links after logout in Chromium. | Cross-browser | High | Medium | 9 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-CHN-006 | Channels | Keep keyboard focus in the expected order on the login form. | Accessibility | Medium | Low | 9 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-CHN-007 | Channels | Keep login form controls inside a 390×844 mobile viewport. | Responsive | Medium | Medium | 9 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-CHN-008 | Channels | Expose account and balance headings in the overview table. | Accessibility | Medium | Low | 9 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-CHN-009 | Channels | Show every required payee field in the bill-pay form. | Functional | Medium | Low | 9 | Pending | Automated | Not fully verified | Y | N | - |  |
| TC-CHN-010 | Accessibility | Scan login page and assert no critical axe violations. | Accessibility | High | Medium | 9 | Pending | Automated | Not fully verified | Y | N | - | Violations attached to result |
| TC-CHN-011 | Accessibility | Scan overview page and assert no critical axe violations. | Accessibility | High | Medium | 9 | Pending | Automated | Not fully verified | Y | N | - | Violations attached to result |
| TC-CHN-012 | Accessibility | Scan transfer page and assert no critical axe violations. | Accessibility | High | Medium | 9 | Pending | Automated | Not fully verified | Y | N | - | Violations attached to result |
| TC-CHN-013 | PayID Simulation | Handle a mocked settled PayID/NPP payment response. | Integration | High | Medium | 9 | Pending | Automated | Not fully verified | Y | N | - | Mock simulation; no native ParaBank PayID |
| TC-CHN-014 | PayID Simulation | Handle a mocked failed PayID/NPP payment response. | Integration | High | Medium | 9 | Pending | Automated | Not fully verified | Y | N | - | Mock simulation; no native ParaBank PayID |
| TC-CHN-015 | PayID Simulation | Handle a mocked timeout PayID/NPP payment response. | Integration | High | Medium | 9 | Pending | Automated | Not fully verified | Y | N | - | Mock simulation; no native ParaBank PayID |
