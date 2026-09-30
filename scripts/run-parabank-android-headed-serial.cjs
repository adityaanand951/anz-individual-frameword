const { spawnSync } = require('node:child_process');
const path = require('node:path');

const deviceUdids = Array.from(new Set(
  (process.env.PARABANK_ANDROID_DEVICE_UDIDS ??
    process.env.ANDROID_DEVICE_UDIDS ??
    'emulator-5554,emulator-5556,emulator-5558')
    .split(',')
    .map((device) => device.trim())
    .filter(Boolean)
));

if (deviceUdids.length === 0) {
  console.error('No Android devices configured. Set PARABANK_ANDROID_DEVICE_UDIDS or ANDROID_DEVICE_UDIDS.');
  process.exit(1);
}

const projectNames = deviceUdids.map(
  (deviceSerial) => `android-${deviceSerial.replace(/[^a-zA-Z0-9_-]/g, '-')}`
);
const playwrightCli = path.join(path.dirname(require.resolve('playwright/package.json')), 'cli.js');
let hasTestFailures = false;

for (const [index, project] of projectNames.entries()) {
  console.log(`\nRunning ParaBank headed UI tests on Android device ${deviceUdids[index]} (${index + 1}/${projectNames.length})`);
  const result = spawnSync(
    process.execPath,
    [
      playwrightCli,
      'test',
      '--config=playwright.parabank.config.ts',
      '--headed',
      '--workers=1',
      '--project',
      project,
      ...process.argv.slice(2)
    ],
    {
      env: { ...process.env, PARABANK_PLATFORM_MATRIX: 'true' },
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024
    }
  );

  if (result.error) {
    throw result.error;
  }
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
    if (/Cloudflare error 1015|ParaBank rate-limited|HTTP 429|Too many requests/i.test(output)) {
      process.exit(result.status ?? 1);
    }
    hasTestFailures = true;
  }
}

process.exit(hasTestFailures ? 1 : 0);
