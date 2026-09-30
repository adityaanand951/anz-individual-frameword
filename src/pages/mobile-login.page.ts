import { expect } from '@wdio/globals';
import type { Browser } from 'webdriverio';

export class MobileLoginPage {
  constructor(private readonly browser: Browser) {}

  get username() { return this.browser.$('#username'); }
  get password() { return this.browser.$('#password'); }
  get signIn() { return this.browser.$('#log-in'); }

  async goto() {
    await this.browser.url(process.env.BASE_URL || 'https://demo.applitools.com/');
  }

  async expectLoaded() {
    await expect(this.username).toBeDisplayed();
    await expect(this.password).toBeDisplayed();
    await expect(this.signIn).toBeEnabled();
  }

  async expectPasswordMasked() {
    await expect(this.password).toHaveAttribute('type', 'password');
  }

  async setRememberMe(checked: boolean) {
    const rememberMe = await this.browser.$('input[type="checkbox"]');
    if ((await rememberMe.isSelected()) !== checked) {
      await rememberMe.click();
    }
  }

  async expectRememberMe(checked: boolean) {
    const selected = await this.browser.$('input[type="checkbox"]').isSelected();
    if (selected !== checked) {
      throw new Error(`Expected Remember Me selected state to be ${checked}, received ${selected}`);
    }
  }

  async login(username = 'user@example.com', password = 'password') {
    await this.username.setValue(username);
    await this.password.setValue(password);
    await this.signIn.click();
  }

  async expectDashboard() {
    await expect(this.browser).toHaveUrl(/\/(?:app|dashboard)\.html(?:$|[?#])/);
  }
}
