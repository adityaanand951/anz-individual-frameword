import { chromium, type Browser, type BrowserContext, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

export function getBaseUrl(): string {
  return process.env.BASE_URL || 'https://demo.applitools.com';
}

export async function launchBrowser(): Promise<Browser> {
  return chromium.launch({ headless: process.env.HEADED !== 'true' });
}

export async function createContext(browser: Browser, baseURL = getBaseUrl()): Promise<BrowserContext> {
  return browser.newContext({
    baseURL,
    ignoreHTTPSErrors: true
  });
}

export async function attachFailureScreenshot(
  page: Page,
  attach: (data: Buffer, mediaType: string) => void,
  scenarioName: string
): Promise<void> {
  const screenshot = await page.screenshot();
  attach(screenshot, 'image/png');

  const outputDirectory = path.resolve('test-results', 'bdd');
  await fs.mkdir(outputDirectory, { recursive: true });
  const fileName = scenarioName.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  await page.screenshot({ path: path.join(outputDirectory, `${fileName || 'scenario'}.png`) });
}
