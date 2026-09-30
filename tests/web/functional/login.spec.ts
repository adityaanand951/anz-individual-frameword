import { test } from '@playwright/test';
import { LoginPage } from '../../../src/pages/login.page';
import { DashboardPage } from '../../../src/pages/dashboard.page';

test('valid user can sign in', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login();
  await login.expectDashboard();
  await new DashboardPage(page).expectLoaded();
});
