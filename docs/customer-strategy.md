# Customer framework-understanding strategy

1. **Discover:** document architecture, environments, authentication, data ownership, release cadence, integrations, supported browsers/devices, regulatory constraints, and the customer definition of done.
2. **Map risk:** run a workshop with product, QA, engineering, operations, and security. Rank journeys by business impact, usage, change frequency, and failure cost.
3. **Observe:** execute a small golden path manually and map each step to UI, API, database, messaging, and third-party dependencies. Record stable test seams and reset strategy.
4. **Baseline:** agree on browser/device matrix, visual tolerance, accessibility standard, API contract policy, test data policy, and acceptable execution time.
5. **Prove:** automate one API, one web, and one mobile journey. Demonstrate parallel execution, diagnostics, reports, and failure triage before scaling.
6. **Scale:** add page objects, service clients, fixtures, tags, data builders, and CI gates. Review flake rate weekly and keep quarantines owned and time-boxed.
7. **Transition:** provide a runbook, coding standards, onboarding session, architecture walkthrough, and ownership matrix. Measure pass rate, flake rate, escaped defects, cycle time, and maintenance effort.

Complex real-world applications to use as discovery exercises include core banking and payments, insurance claims, healthcare patient portals, e-commerce checkout and fulfillment, travel booking, telecom self-care, logistics tracking, and SaaS administration. Select applications with asynchronous workflows, role-based access, third-party integrations, event-driven updates, auditability, and non-trivial test data.
