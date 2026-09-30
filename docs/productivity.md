# Monthly automation productivity plan

## Baseline targets

The targets below are for one engineer-month (20 working days, 8 hours/day) after framework setup.

| Stream | Monthly target | Definition of done | Capacity assumption |
|---|---:|---|---|
| API | 20 automated scenarios | Contract, happy path, negative path, assertion, review, and CI result | 1.5 scenarios/day |
| Web | 30 automated scenarios | Page object, functional assertion, cross-browser/mobile project result, review, and report | 2 scenarios/day |
| Mobile | 15 automated scenarios | Appium flow on the supported device matrix, stable locator, evidence, and review | 1 scenario/day |
| **Total** | **65 scenarios/month** | No unowned or permanently quarantined tests | 3.25 scenarios/day |

These are planning targets, not a promise that every story has equal complexity. Rebaseline monthly using the weighted score below when a scenario is unusually complex.

`productivity score = completed scenarios + (complex scenarios × 0.5) - (rework scenarios × 0.5)`

## Tracking mechanism

1. Create one Jira sub-task per scenario with stream labels: `automation-api`, `automation-web`, or `automation-mobile`.
2. Record the scenario key, complexity (`S`, `M`, `L`), owner, planned date, completion date, test path, commit, CI run, and status in the team tracker.
3. At month end, export Jira issues and calculate: completed/target, cycle time, first-pass rate, flake rate, escaped defects, and maintenance percentage.
4. Review the dashboard weekly. A test is quarantined only with an owner, defect link, reason, and expiry date.
5. Publish Playwright HTML reports, Appium logs, screenshots, and videos as CI artifacts. Never count a scenario as complete without a green CI result.

Recommended status flow: `Backlog -> In progress -> Review -> CI green -> Done`; use `Blocked` only with a linked dependency.
