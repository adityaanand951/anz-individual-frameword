import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const viewports = [
  { name: 'mobile-iphone-13', ...devices['iPhone 13'] },
  { name: 'mobile-pixel-5', ...devices['Pixel 5'] },
  { name: 'mobile-galaxy-s9', ...devices['Galaxy S9+'] },
  { name: 'mobile-iphone-12', ...devices['iPhone 12'] },
  { name: 'mobile-pixel-7', ...devices['Pixel 7'] }
];

export default defineConfig({
  testDir: './tests/web',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results/playwright' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://demo.applitools.com',
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    ...viewports.map((device) => ({ name: device.name, use: device })),
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
