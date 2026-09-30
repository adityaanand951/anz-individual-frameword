import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../src/pages/login.page';

test('dashboard matches the baseline', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login();
  await expect(page).toHaveScreenshot('dashboard.png', { fullPage: true, animations: 'disabled' });
});
