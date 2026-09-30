const { spawnSync } = require('node:child_process');
const path = require('node:path');

const cucumberCli = path.resolve(
  __dirname,
  '..',
  'node_modules',
  '@cucumber',
  'cucumber',
  'bin',
  'cucumber.js'
);

const result = spawnSync(
  process.execPath,
  [
    cucumberCli,
    '--require-module', 'ts-node/register',
    '--require', 'tests/bdd/support/*.ts',
    '--require', 'tests/bdd/steps/*.ts',
    '--format', 'progress',
    '--parallel', '2',
    '--tags', '@api',
    'features',
    ...process.argv.slice(2)
  ],
  {
    env: { ...process.env, HEADED: 'true' },
    stdio: 'inherit'
  }
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
