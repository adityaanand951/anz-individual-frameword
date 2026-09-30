# Jira access and productivity strategy

## Access discovery

Request a least-privilege Jira account or service account with project browse, issue create/edit, and dashboard read access. Confirm the Jira base URL, project key, issue types, required fields, sprint permissions, and whether API tokens or OAuth 2.0 are approved. Store credentials in CI secrets (`JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`); never place them in `.env` committed to source.

Start with a read-only API probe:

```text
GET {JIRA_BASE_URL}/rest/api/3/myself
GET {JIRA_BASE_URL}/rest/api/3/project/{PROJECT_KEY}
GET {JIRA_BASE_URL}/rest/api/3/search?jql=project={PROJECT_KEY} ORDER BY updated DESC
```

Validate access with the customer administrator before enabling issue creation. Use the Jira API only after data residency, retention, and approval requirements are documented.

## Operating model

Create one Epic per product capability (Authentication, Dashboard, Payments, Mobile). Link stories to acceptance criteria and automation specs. Use labels `automation`, `visual`, `a11y`, `api`, and `mobile`. Automation subtasks carry the stream, complexity, owner, test path, and CI report URL.

Defects include environment, build, reproducible steps, evidence, and report links. A failed test is a defect only after reproducing against a known-good baseline. Assign flaky tests to a time-boxed maintenance ticket with an expiry date.
