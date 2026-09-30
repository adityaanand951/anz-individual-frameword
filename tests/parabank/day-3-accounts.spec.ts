import { ParabankAccountsPage } from '../../src/pages/parabank/accounts.page';
import { test, expect } from './fixtures';
import { positiveAccounts, primaryAccount, signIn } from './helpers';

test('registration seeds a default account visible to the Accounts API @api-only', async ({ api, customer }) => {
  const accounts = await api.getAccounts(customer.id);
  expect(accounts.length).toBeGreaterThan(0);
  expect(accounts[0].id).toMatch(/^\d+$/);
});

for (const accountType of ['CHECKING', 'SAVINGS'] as const) {
  test(`customer can open a ${accountType.toLowerCase()} account`, async ({ page, api, customer }) => {
    const source = await primaryAccount(api, customer.id);
    await signIn(page, customer);
    const accountsPage = new ParabankAccountsPage(page);
    await accountsPage.openAccount(accountType, source.id);
    await accountsPage.expectAccountOpened();
    const accountId = await accountsPage.newAccountId();
    const accounts = await api.getAccounts(customer.id);
    expect(accounts.some((account) => account.id === accountId && account.type === accountType)).toBeTruthy();
  });
}

test('account opening is rejected when the funding account has insufficient funds', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  const withdrawal = await api.withdraw(source.id, source.balance);
  expect(withdrawal.status).toBeLessThan(300);
  expect((await api.getAccount(source.id)).balance).toBe(0);
  test.fail(true, 'The public ParaBank demo currently opens an account from a zero-balance source');
  await signIn(page, customer);
  await new ParabankAccountsPage(page).openAccount('CHECKING', source.id);
  await expect(page.locator('#openAccountError')).toBeVisible();
  await expect(page.locator('#openAccountResult')).not.toContainText(/account #\d+ was opened/i);
});

test('five sequential account openings reconcile the account inventory and balance', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  await signIn(page, customer);
  const accountsPage = new ParabankAccountsPage(page);
  const opened: string[] = [];
  for (let index = 0; index < 5; index += 1) {
    await accountsPage.openAccount(index % 2 === 0 ? 'CHECKING' : 'SAVINGS', source.id);
    await accountsPage.expectAccountOpened();
    opened.push(await accountsPage.newAccountId());
  }

  expect(new Set(opened).size).toBe(5);
  const accounts = await api.getAccounts(customer.id);
  for (const id of opened) {
    expect(accounts.some((account) => account.id === id)).toBeTruthy();
  }
  const expectedTotal = accounts.reduce((total, account) => total + Math.round(account.balance * 100), 0) / 100;
  await accountsPage.openOverview();
  await accountsPage.expectAccountPage();
  await expect(page.locator('#accountTable')).toContainText(expectedTotal.toFixed(2));
});

test('Accounts Overview displays the API-seeded account balance', async ({ page, api, customer }) => {
  const account = await primaryAccount(api, customer.id);
  await signIn(page, customer);
  const accountsPage = new ParabankAccountsPage(page);
  await accountsPage.openOverview();
  await accountsPage.expectAccountPage();
  await expect(page.locator('#accountTable')).toContainText(account.id);
  await expect(page.locator('#accountTable')).toContainText(account.balance.toFixed(2));
});

const sourceCounts = [1, 2, 3, 4, 5];
for (const accountCount of sourceCounts) {
  test(`API-created ${accountCount} account${accountCount === 1 ? '' : 's'} are listed after login`, async ({ page, api, customer }) => {
    const accounts = await positiveAccounts(api, customer.id, accountCount);
    await signIn(page, customer);
    const accountsPage = new ParabankAccountsPage(page);
    await accountsPage.openOverview();
    await accountsPage.expectAccountPage();
    for (const account of accounts.slice(0, accountCount)) {
      await expect(page.locator('#accountTable')).toContainText(account.id);
    }
  });
}

for (const accountType of ['CHECKING', 'SAVINGS'] as const) {
  test(`Account API creates a ${accountType.toLowerCase()} account with an identifier @api-only`, async ({ api, customer }) => {
    const source = await primaryAccount(api, customer.id);
    const created = await api.openAccount(customer.id, accountType, source.id);
    expect(created.id).toMatch(/^\d+$/);
    expect(created.type).toBe(accountType);
  });
}

test('account balances returned by the API are finite currency values @api-only', async ({ api, customer }) => {
  const accounts = await api.getAccounts(customer.id);
  expect(accounts.length).toBeGreaterThan(0);
  for (const account of accounts) {
    expect(Number.isFinite(account.balance)).toBeTruthy();
    expect(Math.round(account.balance * 100)).toBe(account.balance * 100);
  }
});

test('account transaction history is available through the ParaBank API @api-only', async ({ api, customer }) => {
  const account = await primaryAccount(api, customer.id);
  const transactions = await api.getTransactions(account.id);
  expect(transactions).toContain('<transactions');
});
