import { spawnSync } from 'node:child_process';

const devices = (process.env.ANDROID_DEVICE_UDIDS || 'emulator-5554,emulator-5556,emulator-5558')
  .split(',')
  .map((device) => device.trim())
  .filter(Boolean);

for (const device of devices) {
  console.log(`\nRunning mobile BDD scenarios on ${device}`);
  const result = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    [
      'cucumber-js',
      '--require-module', 'ts-node/register',
      '--require', 'tests/bdd/mobile/support/*.ts',
      '--require', 'tests/bdd/mobile/steps/*.ts',
      '--format', 'allure-cucumberjs/reporter',
      '--tags', '@mobile',
      'features'
    ],
    {
      env: { ...process.env, BDD_DEVICE_UDID: device },
      stdio: 'inherit'
    }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
