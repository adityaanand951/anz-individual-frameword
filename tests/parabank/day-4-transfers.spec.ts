import { ParabankTransferPage } from '../../src/pages/parabank/transfer.page';
import { test, expect } from './fixtures';
import { amount, primaryAccount, signIn } from './helpers';

async function secondAccount(api: Parameters<typeof primaryAccount>[0], customerId: string, sourceId: string) {
  return api.openAccount(customerId, 'CHECKING', sourceId);
}

async function transactionCount(api: Parameters<typeof primaryAccount>[0], accountId: string) {
  const xml = await api.getTransactions(accountId);
  return Array.from(xml.matchAll(/<transaction>/g)).length;
}

test('transfer between own accounts debits and credits the matching amount', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  const destination = await secondAccount(api, customer.id, source.id);
  const beforeSource = await api.getAccount(source.id);
  const beforeDestination = await api.getAccount(destination.id);
  const transfer = new ParabankTransferPage(page);
  await signIn(page, customer);
  await transfer.transfer(source.id, destination.id, '1.25');
  await transfer.expectResult();
  await expect(page.locator('#showResult')).toContainText(/Transfer Complete/i);
  expect((await api.getAccount(source.id)).balance).toBeCloseTo(beforeSource.balance - 1.25, 2);
  expect((await api.getAccount(destination.id)).balance).toBeCloseTo(beforeDestination.balance + 1.25, 2);
});

test('customer can transfer the full available balance', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  const destination = await secondAccount(api, customer.id, source.id);
  const current = await api.getAccount(source.id);
  await signIn(page, customer);
  const transfer = new ParabankTransferPage(page);
  await transfer.transfer(source.id, destination.id, amount(current.balance));
  await transfer.expectResult();
  expect((await api.getAccount(source.id)).balance).toBe(0);
});

const invalidAmounts = [
  { name: 'amount exceeding the available balance', value: '999999999.99' },
  { name: 'negative amount', value: '-1.00' },
  { name: 'zero amount', value: '0' },
  { name: 'non-numeric amount', value: 'not-a-number' },
  { name: 'more than two decimal places', value: '1.234' }
];

for (const scenario of invalidAmounts) {
  test(`transfer rejects ${scenario.name}`, async ({ page, api, customer }) => {
    const source = await primaryAccount(api, customer.id);
    const destination = await secondAccount(api, customer.id, source.id);
    const beforeBalance = (await api.getAccount(source.id)).balance;
    await signIn(page, customer);
    const transfer = new ParabankTransferPage(page);
    await transfer.transfer(source.id, destination.id, scenario.value);
    await expect(page.locator('#showResult')).not.toContainText(/Transfer Complete/i);
    expect((await api.getAccount(source.id)).balance).toBe(beforeBalance);
  });
}

test('transfer rejects using the same account as source and destination', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  const beforeBalance = (await api.getAccount(source.id)).balance;
  await signIn(page, customer);
  const transfer = new ParabankTransferPage(page);
  await transfer.transfer(source.id, source.id, '1.00');
  await expect(page.locator('#showResult')).not.toContainText(/Transfer Complete/i);
  expect((await api.getAccount(source.id)).balance).toBe(beforeBalance);
});

test('ten rapid transfers create ten debit and ten credit ledger rows', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  const destination = await secondAccount(api, customer.id, source.id);
  const beforeSource = (await api.getAccount(source.id)).balance;
  const beforeDestination = (await api.getAccount(destination.id)).balance;
  const beforeSourceTransactions = await transactionCount(api, source.id);
  const beforeDestinationTransactions = await transactionCount(api, destination.id);
  await signIn(page, customer);
  const transfer = new ParabankTransferPage(page);
  for (let index = 0; index < 10; index += 1) {
    await transfer.transfer(source.id, destination.id, '1.00');
    await expect(page.locator('#showResult')).toContainText(/Transfer Complete/i);
  }
  expect((await api.getAccount(source.id)).balance).toBeCloseTo(beforeSource - 10, 2);
  expect((await api.getAccount(destination.id)).balance).toBeCloseTo(beforeDestination + 10, 2);
  expect(await transactionCount(api, source.id)).toBe(beforeSourceTransactions + 10);
  expect(await transactionCount(api, destination.id)).toBe(beforeDestinationTransactions + 10);
});

for (const value of ['0.01', '1', '1.2', '1.23', '25.00']) {
  test(`transfer accepts valid currency amount ${value}`, async ({ page, api, customer }) => {
    const source = await primaryAccount(api, customer.id);
    const destination = await secondAccount(api, customer.id, source.id);
    const beforeSource = (await api.getAccount(source.id)).balance;
    await signIn(page, customer);
    const transfer = new ParabankTransferPage(page);
    await transfer.transfer(source.id, destination.id, value);
    await expect(page.locator('#showResult')).toContainText(/Transfer Complete/i);
    const expected = Number(value);
    expect((await api.getAccount(source.id)).balance).toBeCloseTo(beforeSource - expected, 2);
  });
}

for (const [fromType, toType] of [
  ['CHECKING', 'SAVINGS'],
  ['SAVINGS', 'CHECKING'],
  ['CHECKING', 'CHECKING']
] as const) {
  test(`transfer from ${fromType.toLowerCase()} to ${toType.toLowerCase()} account`, async ({ page, api, customer }) => {
    const source = await primaryAccount(api, customer.id);
    const destination = await api.openAccount(customer.id, toType, source.id);
    const fundedSource = fromType === source.type
      ? source
      : await api.openAccount(customer.id, fromType, source.id);
    await signIn(page, customer);
    const transfer = new ParabankTransferPage(page);
    await transfer.transfer(fundedSource.id, destination.id, '1.00');
    await expect(page.locator('#showResult')).toContainText(/Transfer Complete/i);
  });
}

test('API rejects a transfer to an unknown destination account @api-only', async ({ api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  const result = await api.transfer(source.id, '0', 1);
  expect(result.status).toBeGreaterThanOrEqual(400);
});
