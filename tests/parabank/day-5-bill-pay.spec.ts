import billers from './data/billers.json';
import { ParabankBillPayPage, type BillPayDetails } from '../../src/pages/parabank/bill-pay.page';
import { test, expect } from './fixtures';
import { amount, primaryAccount, signIn } from './helpers';

function billDetails(name = 'Sydney Energy', amountToPay = '1.00'): BillPayDetails {
  return {
    name,
    street: '10 George Street',
    city: 'Sydney',
    state: 'NSW',
    zipCode: '2000',
    phoneNumber: '0291110001',
    account: '10000001',
    verifyAccount: '10000001',
    amount: amountToPay
  };
}

async function transactionCount(api: Parameters<typeof primaryAccount>[0], accountId: string) {
  const xml = await api.getTransactions(accountId);
  return Array.from(xml.matchAll(/<transaction>/g)).length;
}

test('customer pays a biller and receives a confirmation with a matching debit', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  const beforeBalance = (await api.getAccount(source.id)).balance;
  await signIn(page, customer);
  const billPay = new ParabankBillPayPage(page);
  await billPay.submit(billDetails('Sydney Energy', '12.50'), source.id);
  await billPay.expectConfirmation('Sydney Energy');
  expect((await api.getAccount(source.id)).balance).toBeCloseTo(beforeBalance - 12.5, 2);
});

const requiredPayeeFields = [
  'name',
  'street',
  'city',
  'state',
  'zipCode',
  'phoneNumber',
  'account',
  'verifyAccount',
  'amount'
] as const;

for (const field of requiredPayeeFields) {
  test(`bill payment requires the payee ${field} field`, async ({ page, api, customer }) => {
    const source = await primaryAccount(api, customer.id);
    const beforeBalance = (await api.getAccount(source.id)).balance;
    const details = billDetails();
    details[field] = '';
    await signIn(page, customer);
    await new ParabankBillPayPage(page).submit(details, source.id);
    await expect(page.getByRole('heading', { name: /bill payment complete/i })).not.toBeVisible();
    expect((await api.getAccount(source.id)).balance).toBe(beforeBalance);
  });
}

test('bill payment rejects account-number confirmation mismatch', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  const beforeBalance = (await api.getAccount(source.id)).balance;
  await signIn(page, customer);
  await new ParabankBillPayPage(page).submit(
    { ...billDetails(), verifyAccount: '10000002' },
    source.id
  );
  await expect(page.getByRole('heading', { name: /bill payment complete/i })).not.toBeVisible();
  expect((await api.getAccount(source.id)).balance).toBe(beforeBalance);
});

const paymentAmounts = [
  { name: 'minimum positive amount', value: '0.01', succeeds: true },
  { name: 'zero amount', value: '0', succeeds: false },
  { name: 'blank amount', value: '', succeeds: false },
  { name: 'negative amount', value: '-1.00', succeeds: false },
  { name: 'amount above the available balance', value: '999999999.99', succeeds: false }
];

for (const scenario of paymentAmounts) {
  test(`bill payment handles ${scenario.name}`, async ({ page, api, customer }) => {
    const source = await primaryAccount(api, customer.id);
    const beforeBalance = (await api.getAccount(source.id)).balance;
    const paymentAmount = scenario.name === 'amount above the available balance'
      ? amount(beforeBalance + 0.01)
      : scenario.value;
    await signIn(page, customer);
    const billPay = new ParabankBillPayPage(page);
    await billPay.submit(billDetails('Boundary Biller', paymentAmount), source.id);
    if (scenario.value === '-1.00') {
      test.fail(true, 'ParaBank currently accepts negative bill payment amounts');
    } else if (scenario.name === 'amount above the available balance') {
      test.fail(true, 'ParaBank currently permits bill payments that overdraw the source account');
    }
    if (scenario.succeeds) {
      await billPay.expectConfirmation('Boundary Biller');
      expect((await api.getAccount(source.id)).balance).toBeCloseTo(beforeBalance - 0.01, 2);
    } else {
      await expect(page.getByRole('heading', { name: /bill payment complete/i })).not.toBeVisible();
      expect((await api.getAccount(source.id)).balance).toBe(beforeBalance);
    }
  });
}

test('paying the same biller twice creates two separate debit transactions', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  const beforeBalance = (await api.getAccount(source.id)).balance;
  const beforeTransactions = await transactionCount(api, source.id);
  await signIn(page, customer);
  const billPay = new ParabankBillPayPage(page);
  await billPay.submit(billDetails('Recurring Biller'), source.id);
  await billPay.expectConfirmation('Recurring Biller');
  await billPay.submit(billDetails('Recurring Biller'), source.id);
  await billPay.expectConfirmation('Recurring Biller');
  expect((await api.getAccount(source.id)).balance).toBeCloseTo(beforeBalance - 2, 2);
  expect(await transactionCount(api, source.id)).toBe(beforeTransactions + 2);
});

test('batch pays ten billers from JSON data and reconciles total debits', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  const beforeBalance = (await api.getAccount(source.id)).balance;
  const beforeTransactions = await transactionCount(api, source.id);
  const total = billers.length * 1.25;
  await signIn(page, customer);
  const billPay = new ParabankBillPayPage(page);
  for (const biller of billers) {
    const details: BillPayDetails = {
      ...biller,
      verifyAccount: biller.account,
      amount: '1.25'
    };
    await billPay.submit(details, source.id);
    await billPay.expectConfirmation(biller.name);
  }
  expect((await api.getAccount(source.id)).balance).toBeCloseTo(beforeBalance - total, 2);
  expect(await transactionCount(api, source.id)).toBe(beforeTransactions + billers.length);
});
