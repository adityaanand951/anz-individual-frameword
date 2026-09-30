import { expect, type Page } from '@playwright/test';

export type ParabankAccountType = 'CHECKING' | 'SAVINGS';

export class ParabankAccountsPage {
  constructor(private readonly page: Page) {}

  async openOverview() {
    await this.page.getByRole('link', { name: 'Accounts Overview' }).click();
  }

  async openAccountForm() {
    await this.page.getByRole('link', { name: 'Open New Account' }).click();
  }

  async openAccount(type: ParabankAccountType, sourceAccountId?: string) {
    await this.openAccountForm();
    await this.page.locator('#type').selectOption(type === 'CHECKING' ? '0' : '1');
    if (sourceAccountId) {
      await this.page.locator('#fromAccountId').selectOption(sourceAccountId);
    }
    await this.page.getByRole('button', { name: /open new account/i }).click();
  }

  async expectAccountOpened() {
    await expect(this.page.locator('#newAccountId')).toBeVisible();
    await expect(this.page.locator('#newAccountId')).not.toBeEmpty();
  }

  async newAccountId() {
    return (await this.page.locator('#newAccountId').innerText()).trim();
  }

  async expectAccountListed(accountId: string) {
    await this.openOverview();
    await expect(this.page.locator('#accountTable')).toContainText(accountId);
  }

  async expectAccountPage() {
    await expect(this.page.getByRole('heading', { name: /accounts overview/i })).toBeVisible();
  }
}
