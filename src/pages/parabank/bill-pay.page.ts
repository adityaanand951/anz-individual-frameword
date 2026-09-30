import { expect, type Page } from '@playwright/test';

export type BillPayDetails = {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  account: string;
  verifyAccount: string;
  amount: string;
};

const billPayFields: Record<keyof BillPayDetails, string> = {
  name: 'payee.name',
  street: 'payee.address.street',
  city: 'payee.address.city',
  state: 'payee.address.state',
  zipCode: 'payee.address.zipCode',
  phoneNumber: 'payee.phoneNumber',
  account: 'payee.accountNumber',
  verifyAccount: 'verifyAccount',
  amount: 'amount'
};

export class ParabankBillPayPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.getByRole('link', { name: 'Bill Pay' }).click();
  }

  async submit(details: BillPayDetails, fromAccountId: string) {
    await this.open();
    for (const key of Object.keys(billPayFields) as (keyof BillPayDetails)[]) {
      await this.page.locator(`input[name="${billPayFields[key]}"]`).fill(details[key]);
    }
    await this.page.locator('select[name="fromAccountId"]').selectOption(fromAccountId);
    await this.page.getByRole('button', { name: /send payment/i }).click();
  }

  async expectConfirmation(payeeName: string) {
    await expect(this.page.getByRole('heading', { name: /bill payment complete/i })).toBeVisible();
    await expect(this.page.locator('#billpayResult')).toContainText(payeeName);
  }

  async expectFormVisible() {
    await expect(this.page.locator('form')).toBeVisible();
  }
}
