import { expect, type Page } from '@playwright/test';

export class ParabankTransferPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.getByRole('link', { name: 'Transfer Funds' }).click();
  }

  async transfer(fromAccountId: string, toAccountId: string, amount: string) {
    await this.open();
    await this.page.locator('#amount').fill(amount);
    await this.page.locator('#fromAccountId').selectOption(fromAccountId);
    await this.page.locator('#toAccountId').selectOption(toAccountId);
    const transferResponse = this.page.waitForResponse((response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname.includes('/services_proxy/bank/transfer')
    );
    await Promise.all([
      this.page.locator('input[value="Transfer"]').click(),
      transferResponse
    ]);
  }

  async expectResult() {
    await expect(this.page.locator('#showResult')).toBeVisible();
  }

  async expectRejected() {
    await expect(this.page.locator('#showResult')).not.toContainText(/Transfer Complete/i);
    await expect(this.page.locator('#showError')).toBeVisible();
  }
}
