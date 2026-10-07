const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(root, '.env') });
const baseUrl = process.env.PARABANK_BASE_URL || '';
if (!baseUrl || /parabank\.parasoft\.com/i.test(baseUrl)) {
  console.error(
    'Day 10 stability runs require an approved isolated ParaBank instance. Set PARABANK_BASE_URL to that instance.'
  );
  process.exit(2);
}

const outputDir = path.join(root, 'test-results', 'parabank-day-10');
fs.mkdirSync(outputDir, { recursive: true });
const cliPath = require.resolve('@playwright/test/cli');
const runs = [];

function htmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function countOutcomes(suite, counts) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      if (test.status === 'expected' && test.expectedStatus === 'passed') {
        counts.passed += 1;
      } else if (test.status === 'expected' && test.expectedStatus === 'failed') {
        counts.expectedFailures += 1;
      } else if (test.status === 'unexpected') {
        counts.failed += 1;
      } else if (test.status === 'flaky') {
        counts.flaky += 1;
      }
    }
  }
  for (const child of suite.suites ?? []) {
    countOutcomes(child, counts);
  }
  return counts;
}

for (let index = 1; index <= 3; index += 1) {
  const result = spawnSync(
    process.execPath,
    [cliPath, 'test', '--config=playwright.parabank.config.ts', '--reporter=json'],
    {
      cwd: root,
      env: process.env,
      encoding: 'utf8',
      maxBuffer: 40 * 1024 * 1024
    }
  );
  if (result.error) {
    throw result.error;
  }

  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch (error) {
    fs.writeFileSync(path.join(outputDir, `run-${index}-stdout.txt`), result.stdout);
    fs.writeFileSync(path.join(outputDir, `run-${index}-stderr.txt`), result.stderr);
    throw new Error(`Run ${index} did not produce valid Playwright JSON: ${error.message}`);
  }

  const stats = report.stats ?? {};
  const outcomes = countOutcomes(report, {
    passed: 0,
    failed: 0,
    expectedFailures: 0,
    flaky: 0
  });
  const run = {
    run: index,
    exitCode: result.status,
    startTime: stats.startTime ?? null,
    durationMs: stats.duration ?? null,
    ...outcomes,
    skipped: stats.skipped ?? 0
  };
  runs.push(run);
  fs.writeFileSync(path.join(outputDir, `run-${index}.json`), JSON.stringify(report, null, 2));
  console.log(
    `Run ${index}/3: ${run.passed} passed, ${run.failed} failed, ${run.expectedFailures} expected failures, ` +
    `${run.skipped} skipped, ` +
    `${run.flaky} flaky (${Math.round((run.durationMs ?? 0) / 1000)}s)`
  );

  if (result.stderr.trim()) {
    process.stderr.write(result.stderr);
  }
}

const total = runs.reduce((result, run) => ({
  passed: result.passed + run.passed,
  failed: result.failed + run.failed,
  expectedFailures: result.expectedFailures + run.expectedFailures,
  skipped: result.skipped + run.skipped,
  flaky: result.flaky + run.flaky
}), { passed: 0, failed: 0, expectedFailures: 0, skipped: 0, flaky: 0 });

const tableRows = runs.map((run) =>
  `<tr><td>${run.run}</td><td>${run.passed}</td><td>${run.failed}</td><td>${run.expectedFailures}</td>` +
  `<td>${run.skipped}</td><td>${run.flaky}</td>` +
  `<td>${run.durationMs === null ? 'n/a' : `${(run.durationMs / 1000).toFixed(1)}s`}</td></tr>`
).join('');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>ParaBank Day 10 Stability Report</title>
<style>body{font:16px Segoe UI,Arial,sans-serif;max-width:1100px;margin:40px auto;color:#18212b}
table{border-collapse:collapse;width:100%;margin:20px 0}th,td{padding:10px;border:1px solid #ccd3da;text-align:left}
th{background:#12304a;color:white}code{background:#eef2f6;padding:3px} .note{padding:14px;background:#fff5d8}</style>
</head><body><h1>ParaBank Day 10 Stability Report</h1>
<p>Target: <code>${htmlEscape(baseUrl)}</code></p>
<p>Generated: ${new Date().toISOString()}</p>
<table><thead><tr><th>Run</th><th>Passed</th><th>Failed</th><th>Expected failures</th><th>Skipped</th><th>Flaky</th><th>Duration</th></tr></thead>
<tbody>${tableRows}</tbody></table>
<h2>Aggregate</h2><p>${total.passed} passed · ${total.failed} failed · ${total.expectedFailures} expected failures · ` +
  `${total.skipped} skipped · ${total.flaky} flaky executions</p>
<p class="note">The run-level JSON reports are stored beside this file. Defect counts and productivity metrics must be entered from verified evidence; this report does not infer them.</p>
</body></html>`;

fs.writeFileSync(path.join(outputDir, 'index.html'), html);
fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), runs, total }, null, 2));
console.log(`Consolidated report: ${path.relative(root, path.join(outputDir, 'index.html'))}`);

if (runs.some((run) => run.exitCode !== 0 || run.failed > 0 || run.flaky > 0)) {
  process.exitCode = 1;
}
