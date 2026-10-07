import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests/parabank/api',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 45_000,
  outputDir: 'test-results/parabank-api',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/parabank-api', open: 'never' }]],
  use: {
    baseURL: process.env.PARABANK_BASE_URL || 'https://parabank.parasoft.com/parabank/',
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure'
  }
});
