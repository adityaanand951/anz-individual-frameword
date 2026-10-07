import type { Page } from '@playwright/test';
import { ParabankLoginPage } from '../../src/pages/parabank/login.page';
import { ParabankApi, type ParabankAccount, type ParabankCustomer } from '../../src/support/parabank-api';

export async function signIn(page: Page, customer: ParabankCustomer) {
  const login = new ParabankLoginPage(page);
  await login.goto();
  await login.login(customer.username, customer.password);
  await login.expectAuthenticated();
}

export async function primaryAccount(api: ParabankApi, customerId: string): Promise<ParabankAccount> {
  const accounts = await api.getAccounts(customerId);
  if (accounts.length === 0) {
    throw new Error(`ParaBank customer ${customerId} has no seed account`);
  }
  return accounts.find((account) => account.balance > 0) ?? accounts[0];
}

export async function positiveAccounts(api: ParabankApi, customerId: string, minimum: number): Promise<ParabankAccount[]> {
  const accounts = await api.getAccounts(customerId);
  let source = accounts.find((account) => account.balance > 0);
  if (!source) {
    throw new Error(`ParaBank customer ${customerId} has no funded account`);
  }
  while (accounts.filter((account) => account.balance > 0).length < minimum) {
    const created = await api.openAccount(customerId, 'CHECKING', source.id);
    if (created.balance <= 0) {
      await api.deposit(created.id, 10);
    }
    const fundedAccount = await api.getAccount(created.id);
    accounts.push(fundedAccount);
    source = fundedAccount.balance > 0 ? fundedAccount : source;
  }
  const funded = accounts.filter((account) => account.balance > 0);
  if (funded.length < minimum) {
    throw new Error(`Expected ${minimum} funded ParaBank accounts, found ${funded.length}`);
  }
  return funded.slice(0, minimum);
}

export function amount(value: number): string {
  return value.toFixed(2);
}
