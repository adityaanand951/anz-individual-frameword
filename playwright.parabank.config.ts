import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const platformMatrixEnabled = process.env.PARABANK_PLATFORM_MATRIX === 'true';
const androidDeviceUdids = Array.from(new Set(
  (process.env.PARABANK_ANDROID_DEVICE_UDIDS ??
    process.env.ANDROID_DEVICE_UDIDS ??
    'emulator-5554,emulator-5556,emulator-5558')
    .split(',')
    .map((device) => device.trim())
    .filter(Boolean)
));

if (platformMatrixEnabled && androidDeviceUdids.length === 0) {
  throw new Error(
    'Set PARABANK_ANDROID_DEVICE_UDIDS or ANDROID_DEVICE_UDIDS to run the ParaBank platform matrix'
  );
}

const mobileViewports = [
  { name: 'mobile-iphone-13', device: devices['iPhone 13'] },
  { name: 'mobile-pixel-5', device: devices['Pixel 5'] },
  { name: 'mobile-galaxy-s9', device: devices['Galaxy S9+'] },
  { name: 'mobile-iphone-12', device: devices['iPhone 12'] },
  { name: 'mobile-pixel-7', device: devices['Pixel 7'] }
];

export default defineConfig({
  testDir: './tests/parabank',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 45_000,
  outputDir: 'test-results/parabank',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/parabank', open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results/parabank' }]
  ],
  use: {
    baseURL: process.env.PARABANK_BASE_URL || 'https://parabank.parasoft.com/parabank/',
    ...devices['Desktop Chrome'],
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    ...(platformMatrixEnabled
      ? [
          ...mobileViewports.map(({ name, device }) => ({
            name,
            grepInvert: /@api-only/,
            use: { ...device }
          })),
          ...androidDeviceUdids.map((deviceSerial) => ({
            name: `android-${deviceSerial.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
            grepInvert: /@api-only/,
            metadata: { androidDeviceSerial: deviceSerial },
            use: { ...devices['Desktop Chrome'] }
          }))
        ]
      : [])
  ]
});
