import { After, Given, Then, When } from '@cucumber/cucumber';
import { expect, request as playwrightRequest } from '@playwright/test';
import { ParabankAccountsPage } from '../../../src/pages/parabank/accounts.page';
import { ParabankBillPayPage } from '../../../src/pages/parabank/bill-pay.page';
import { ParabankLoginPage } from '../../../src/pages/parabank/login.page';
import { ParabankTransferPage } from '../../../src/pages/parabank/transfer.page';
import { ParabankApi, type ParabankCustomer } from '../../../src/support/parabank-api';
import { navigateParaBank } from '../../../src/support/parabank-rate-limit';
import { BddWorld } from '../support/world';

const parabankBaseUrl = process.env.PARABANK_BASE_URL || 'https://parabank.parasoft.com/parabank/';
let seededCustomer: Promise<ParabankCustomer> | undefined;

Given('a ParaBank customer is seeded through the API', async function (this: BddWorld) {
  this.parabankRequest = await playwrightRequest.newContext({
    baseURL: parabankBaseUrl,
    ignoreHTTPSErrors: true
  });
  this.parabankApi = new ParabankApi(this.parabankRequest);

  seededCustomer ??= (async () => {
    const customer = await this.parabankApi.createCustomer();
    const [source] = await this.parabankApi.getAccounts(customer.id);
    if (!source) {
      throw new Error(`ParaBank customer ${customer.id} has no default account`);
    }
    await this.parabankApi.deposit(source.id, 10_000);
    return customer;
  })();

  this.parabankCustomer = await seededCustomer;
  const [source] = await this.parabankApi.getAccounts(this.parabankCustomer.id);
  if (!source) {
    throw new Error(`ParaBank customer ${this.parabankCustomer.id} has no default account`);
  }
  this.parabankSourceAccountId = source.id;
});

Given('I sign in to ParaBank as that customer', async function (this: BddWorld) {
  const login = new ParabankLoginPage(this.page);
  await navigateParaBank(this.page, new URL('index.htm', parabankBaseUrl).toString());
  await login.login(this.parabankCustomer.username, this.parabankCustomer.password);
  await login.expectAuthenticated();
});

When('I open a savings account funded from the seeded account', async function (this: BddWorld) {
  await new ParabankAccountsPage(this.page).openAccount('SAVINGS', this.parabankSourceAccountId);
});

Then('the new account should appear in Accounts Overview', async function (this: BddWorld) {
  const accountsPage = new ParabankAccountsPage(this.page);
  await accountsPage.expectAccountOpened();
  const accountId = await accountsPage.newAccountId();
  await accountsPage.expectAccountListed(accountId);
});

Then('the ParaBank Accounts Overview should show the seeded account and balance', async function (this: BddWorld) {
  const [account] = await this.parabankApi.getAccounts(this.parabankCustomer.id);
  if (!account) {
    throw new Error(`ParaBank customer ${this.parabankCustomer.id} has no account to verify`);
  }
  await new ParabankAccountsPage(this.page).openOverview();
  await expect(this.page.locator('#accountTable')).toContainText(account.id);
  await expect(this.page.locator('#accountTable')).toContainText(account.balance.toFixed(2));
});

When(
  'I transfer {string} from the seeded account to another account',
  async function (this: BddWorld, amount: string) {
    this.parabankTransferAmount = Number(amount);
    const destination = await this.parabankApi.openAccount(
      this.parabankCustomer.id,
      'CHECKING',
      this.parabankSourceAccountId
    );
    this.parabankDestinationAccountId = destination.id;
    const source = await this.parabankApi.getAccount(this.parabankSourceAccountId);
    this.parabankSourceBalanceBefore = source.balance;
    this.parabankDestinationBalanceBefore = (
      await this.parabankApi.getAccount(destination.id)
    ).balance;
    await new ParabankTransferPage(this.page).transfer(
      this.parabankSourceAccountId,
      destination.id,
      amount
    );
  }
);

Then('the transfer confirmation should be displayed', async function (this: BddWorld) {
  await expect(this.page.locator('#showResult')).toContainText(/Transfer Complete/i);
});

Then('the source and destination balances should reconcile', async function (this: BddWorld) {
  const expectedSourceCents = Math.round(
    (this.parabankSourceBalanceBefore - this.parabankTransferAmount) * 100
  );
  const expectedDestinationCents = Math.round(
    (this.parabankDestinationBalanceBefore + this.parabankTransferAmount) * 100
  );

  await expect.poll(async () => {
    const source = await this.parabankApi.getAccount(this.parabankSourceAccountId);
    const destination = await this.parabankApi.getAccount(this.parabankDestinationAccountId);
    return {
      sourceCents: Math.round(source.balance * 100),
      destinationCents: Math.round(destination.balance * 100)
    };
  }, { timeout: 10_000 }).toEqual({
    sourceCents: expectedSourceCents,
    destinationCents: expectedDestinationCents
  });
});

When('I pay {string} to the {string} biller', async function (this: BddWorld, amount: string, payeeName: string) {
  const source = await this.parabankApi.getAccount(this.parabankSourceAccountId);
  this.parabankSourceBalanceBefore = source.balance;
  await new ParabankBillPayPage(this.page).submit({
    name: payeeName,
    street: '10 George Street',
    city: 'Sydney',
    state: 'NSW',
    zipCode: '2000',
    phoneNumber: '0291110001',
    account: '10000001',
    verifyAccount: '10000001',
    amount
  }, this.parabankSourceAccountId);
});

Then('the bill payment confirmation should be displayed', async function (this: BddWorld) {
  await new ParabankBillPayPage(this.page).expectConfirmation('ANZ Electricity');
});

Then('the source account balance should reflect the payment', async function (this: BddWorld) {
  const source = await this.parabankApi.getAccount(this.parabankSourceAccountId);
  expect(source.balance).toBeCloseTo(this.parabankSourceBalanceBefore - 7.5, 2);
});

After(async function (this: BddWorld) {
  await this.parabankRequest?.dispose();
});
