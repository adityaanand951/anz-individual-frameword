const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { ensureIsolatedTargetForParallelRun } = require('./parabank-target.cjs');

try {
  ensureIsolatedTargetForParallelRun();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [
    path.join(path.dirname(require.resolve('playwright/package.json')), 'cli.js'),
    'test',
    '--config=playwright.parabank.config.ts',
    ...process.argv.slice(2),
    '--workers=2'
  ],
  {
    env: { ...process.env, PARABANK_PLATFORM_MATRIX: 'true' },
    stdio: 'inherit'
  }
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
