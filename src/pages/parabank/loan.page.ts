import { expect, type Page } from '@playwright/test';

export class ParabankLoanPage {
  constructor(private readonly page: Page) {}

  async apply(amount: string, downPayment: string, fromAccountId: string) {
    await this.page.getByRole('link', { name: /request loan/i }).click();
    await this.page.locator('#amount').fill(amount);
    await this.page.locator('#downPayment').fill(downPayment);
    await this.page.locator('#fromAccountId').selectOption(fromAccountId);
    await this.page.getByRole('button', { name: /apply now/i }).click();
  }

  async expectApproved() {
    await expect(this.page.locator('#loanStatus')).toContainText(/approved/i);
    await expect(this.page.locator('#newAccountId')).toBeVisible();
    await expect(this.page.locator('#newAccountId')).not.toBeEmpty();
  }

  async expectDenied() {
    await expect(this.page.locator('#loanStatus')).toContainText(/denied/i);
  }

  async newAccountId() {
    return (await this.page.locator('#newAccountId').innerText()).trim();
  }
}
