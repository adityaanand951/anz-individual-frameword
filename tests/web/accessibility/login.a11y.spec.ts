import { test, expect } from '@playwright/test';

test('login has accessible form controls', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#username')).toHaveAttribute('id', 'username');
  await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  await expect(page.locator('#log-in')).toBeEnabled();
});
