import { ParabankBillPayPage, type BillPayDetails } from '../../src/pages/parabank/bill-pay.page';
import { ParabankLoanPage } from '../../src/pages/parabank/loan.page';
import { ParabankTransferPage } from '../../src/pages/parabank/transfer.page';
import { ParabankAccountsPage } from '../../src/pages/parabank/accounts.page';
import { test, expect } from './fixtures';
import { amount, primaryAccount, signIn } from './helpers';
import { seedTransactions } from '../../src/support/parabank-transaction-seeding';

const loanAmount = '500.00';
const standardDownPayment = '150.00';

function billDetails(name: string, payment: string): BillPayDetails {
  return {
    name,
    street: '10 George Street',
    city: 'Sydney',
    state: 'NSW',
    zipCode: '2000',
    phoneNumber: '0291110001',
    account: '10000001',
    verifyAccount: '10000001',
    amount: payment
  };
}

async function setAccountBalance(api: Parameters<typeof primaryAccount>[0], accountId: string, target: number) {
  const current = (await api.getAccount(accountId)).balance;
  if (current > target) {
    await api.withdraw(accountId, current - target);
  } else if (current < target) {
    await api.deposit(accountId, target - current);
  }
}

test('valid loan application is approved and displays the new loan account', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  await signIn(page, customer);
  const loan = new ParabankLoanPage(page);
  await loan.apply(loanAmount, standardDownPayment, source.id);
  await loan.expectApproved();
  const loanAccount = await api.getAccount(await loan.newAccountId());
  expect(loanAccount.balance).toBeGreaterThan(0);
});

test('loan is denied when down payment exceeds the available source balance', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  const beforeBalance = (await api.getAccount(source.id)).balance;
  await signIn(page, customer);
  const loan = new ParabankLoanPage(page);
  await loan.apply('1000.00', amount(beforeBalance + 1), source.id);
  await loan.expectDenied();
  expect((await api.getAccount(source.id)).balance).toBe(beforeBalance);
});

const invalidLoanInputs = [
  { label: 'zero loan amount', amount: '0.00', downPayment: '0.00' },
  { label: 'negative loan amount', amount: '-1.00', downPayment: '0.01' },
  { label: 'blank down payment', amount: '500.00', downPayment: '' },
  { label: 'non-numeric down payment', amount: '500.00', downPayment: 'not-a-number' },
  { label: 'down payment equal to loan amount', amount: '500.00', downPayment: '500.00' }
] as const;

for (const scenario of invalidLoanInputs) {
  test(`loan application handles ${scenario.label}`, async ({ page, api, customer }) => {
    const source = await primaryAccount(api, customer.id);
    const beforeBalance = (await api.getAccount(source.id)).balance;
    await signIn(page, customer);
    const loan = new ParabankLoanPage(page);
    await loan.apply(scenario.amount, scenario.downPayment, source.id);
    await loan.expectDenied();
    expect((await api.getAccount(source.id)).balance).toBe(beforeBalance);
  });
}

const approvalMatrix = [
  { amount: 1_000, downPayment: 250, balance: 1_000, approved: true },
  { amount: 1_000, downPayment: 199, balance: 1_000, approved: false },
  { amount: 1_000, downPayment: 250, balance: 249, approved: false },
  { amount: 500, downPayment: 150, balance: 150, approved: true },
  { amount: 500, downPayment: 200, balance: 199, approved: false }
] as const;

for (const [index, scenario] of approvalMatrix.entries()) {
  test(`loan approval matrix case ${index + 1}`, async ({ page, api, customer }) => {
    const source = await primaryAccount(api, customer.id);
    await setAccountBalance(api, source.id, scenario.balance);

    await signIn(page, customer);
    const loan = new ParabankLoanPage(page);
    await loan.apply(scenario.amount.toFixed(2), scenario.downPayment.toFixed(2), source.id);
    if (scenario.approved) {
      await loan.expectApproved();
    } else {
      await loan.expectDenied();
    }
  });
}

test('funds from an approved loan account can be transferred to another account', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  await setAccountBalance(api, source.id, 2_000);
  const destination = await api.openAccount(customer.id, 'CHECKING', source.id);
  await signIn(page, customer);
  const loan = new ParabankLoanPage(page);
  await loan.apply(loanAmount, standardDownPayment, source.id);
  await loan.expectApproved();
  const loanAccountId = await loan.newAccountId();
  const beforeDestination = (await api.getAccount(destination.id)).balance;
  const transfer = new ParabankTransferPage(page);
  await transfer.transfer(loanAccountId, destination.id, '10.00');
  await transfer.expectResult();
  expect((await api.getAccount(loanAccountId)).balance).toBeGreaterThan(0);
  expect((await api.getAccount(destination.id)).balance).toBeCloseTo(beforeDestination + 10, 2);
});

test('approved loan account is listed in Accounts Overview', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  await signIn(page, customer);
  const loan = new ParabankLoanPage(page);
  await loan.apply(loanAmount, standardDownPayment, source.id);
  await loan.expectApproved();
  const accountId = await loan.newAccountId();
  const accounts = new ParabankAccountsPage(page);
  await accounts.openOverview();
  await accounts.expectAccountListed(accountId);
});

test('flagship journey registers, funds savings, gets an approved loan, pays a bill and reconciles every ledger', async ({
  page,
  api
}) => {
  test.setTimeout(180_000);
  const customer = await api.createCustomer();
  const accountsBefore = await api.getAccounts(customer.id);
  const original = accountsBefore[0];
  if (!original) {
    throw new Error('New ParaBank customer has no default account');
  }

  await api.deposit(original.id, 1_000);
  const openingTransactions = await api.getTransactionList(original.id);
  const seed = await seedTransactions(api, original.id, { count: 1, amountForIndex: () => 1.11 });
  expect(seed).toHaveLength(1);

  await signIn(page, customer);
  const accountsPage = new ParabankAccountsPage(page);
  await accountsPage.openAccount('SAVINGS', original.id);
  await accountsPage.expectAccountOpened();
  const savingsId = await accountsPage.newAccountId();
  await api.deposit(savingsId, 1_000);
  const savingsBeforeLoan = await api.getTransactionList(savingsId);

  const loan = new ParabankLoanPage(page);
  await loan.apply(loanAmount, standardDownPayment, savingsId);
  await loan.expectApproved();
  const loanAccountId = await loan.newAccountId();
  const loanAccountTransactions = await api.getTransactionList(loanAccountId);
  expect(loanAccountTransactions.length).toBeGreaterThan(0);

  const loanBeforeBill = await api.getAccount(loanAccountId);
  const billPay = new ParabankBillPayPage(page);
  await billPay.submit(billDetails('Flagship Utilities', '5.00'), loanAccountId);
  await billPay.expectConfirmation('Flagship Utilities');
  const loanAfterBill = await api.getAccount(loanAccountId);
  expect(loanAfterBill.balance).toBeCloseTo(loanBeforeBill.balance - 5, 2);

  const originalAfter = await api.getTransactionList(original.id);
  const savingsAfter = await api.getTransactionList(savingsId);
  const loanAfter = await api.getTransactionList(loanAccountId);
  expect(originalAfter.length).toBeGreaterThan(openingTransactions.length);
  expect(originalAfter.some(({ id }) => seed.some((seeded) => seeded.id === id))).toBeTruthy();
  expect(savingsAfter.length).toBeGreaterThan(savingsBeforeLoan.length);
  expect(savingsAfter.some(({ description }) => /loan/i.test(description))).toBeTruthy();
  expect(loanAfter.length).toBeGreaterThan(loanAccountTransactions.length);
  expect(loanAfter.some(({ description, amount: value }) => /bill|payment/i.test(description) && value === 5)).toBeTruthy();

  await accountsPage.openOverview();
  await expect(page.locator('#accountTable')).toContainText(original.id);
  await expect(page.locator('#accountTable')).toContainText(savingsId);
  await expect(page.locator('#accountTable')).toContainText(loanAccountId);
});
