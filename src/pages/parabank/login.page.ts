import { expect, type Page } from '@playwright/test';
import { navigateParaBank } from '../../support/parabank-rate-limit';

export class ParabankLoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await navigateParaBank(this.page, 'index.htm');
  }

  async login(username: string, password: string) {
    await this.page.locator('input[name="username"]').fill(username);
    await this.page.locator('input[name="password"]').fill(password);
    await this.page.getByRole('button', { name: /log in/i }).click();
  }

  async expectLoginPage() {
    await expect(this.page.getByRole('heading', { name: 'Customer Login' })).toBeVisible();
    await expect(this.page.locator('input[name="username"]')).toBeVisible();
    await expect(this.page.locator('input[name="password"]')).toBeVisible();
  }

  async expectAuthenticated() {
    await expect(this.page).toHaveURL(/overview\.htm/);
    await expect(this.page.locator('#leftPanel')).toContainText(/Welcome/i);
  }

  async expectLoginRejected() {
    await expect(this.page).toHaveURL(/index\.htm|login\.htm/);
    await expect(this.page.locator('p.error')).toContainText(/could not be verified|invalid|enter a username and password/i);
  }
}
