import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests/parabank',
  testMatch: 'day-9-channels.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  outputDir: 'test-results/parabank/day-9',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/parabank/day-9', open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results/parabank' }]
  ],
  use: {
    baseURL: process.env.PARABANK_BASE_URL || 'https://parabank.parasoft.com/parabank/',
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    {
      name: 'mobile-390x844',
      use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 1 }
    }
  ]
});
