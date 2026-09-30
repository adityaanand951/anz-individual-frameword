import { expect, type Page } from '@playwright/test';
import { navigateParaBank } from '../../support/parabank-rate-limit';

export type RegistrationFields = {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  ssn: string;
  username: string;
  password: string;
  repeatedPassword: string;
};

const fieldNames: Record<keyof RegistrationFields, string> = {
  firstName: 'customer.firstName',
  lastName: 'customer.lastName',
  street: 'customer.address.street',
  city: 'customer.address.city',
  state: 'customer.address.state',
  zipCode: 'customer.address.zipCode',
  phoneNumber: 'customer.phoneNumber',
  ssn: 'customer.ssn',
  username: 'customer.username',
  password: 'customer.password',
  repeatedPassword: 'repeatedPassword'
};

export class ParabankRegistrationPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await navigateParaBank(this.page, 'register.htm');
  }

  async register(fields: RegistrationFields) {
    for (const key of Object.keys(fieldNames) as (keyof RegistrationFields)[]) {
      await this.page.locator(`input[name="${fieldNames[key]}"]`).fill(fields[key]);
    }
    await this.page.locator(`input[name="${fieldNames.repeatedPassword}"]`).press('Enter');
  }

  async expectFormVisible() {
    await expect(this.page.locator('#customerForm')).toBeVisible();
  }
}
