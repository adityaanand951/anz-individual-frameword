import { expect, type Page } from '@playwright/test';

export class LoginPage {
  readonly username;
  readonly password;
  readonly signIn;

  constructor(private readonly page: Page) {
    this.username = page.locator('#username');
    this.password = page.locator('#password');
    this.signIn = page.locator('#log-in');
  }

  async goto() { await this.page.goto('/'); }
  async expectLoaded() {
    await expect(this.page).toHaveTitle(/ACME Demo App/i);
    await expect(this.username).toBeVisible();
    await expect(this.password).toBeVisible();
    await expect(this.signIn).toBeEnabled();
  }
  async expectPasswordMasked() { await expect(this.password).toHaveAttribute('type', 'password'); }
  async setRememberMe(checked: boolean) {
    const rememberMe = this.page.getByRole('checkbox', { name: /remember me/i });
    await rememberMe.setChecked(checked);
  }
  async expectRememberMe(checked: boolean) {
    await expect(this.page.getByRole('checkbox', { name: /remember me/i })).toBeChecked({ checked });
  }
  async login(user = 'user@example.com', password = 'password') {
    await this.username.fill(user);
    await this.password.fill(password);
    await this.signIn.click();
  }
  async expectDashboard() { await expect(this.page).toHaveURL(/\/(?:app|dashboard)\.html(?:$|[?#])/); }
}
