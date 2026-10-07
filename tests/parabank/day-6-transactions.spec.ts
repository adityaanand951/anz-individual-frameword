import { ParabankTransactionsPage } from '../../src/pages/parabank/transactions.page';
import { test, expect } from './fixtures';
import { positiveAccounts, primaryAccount, signIn } from './helpers';
import { dateOnly, seedTransactions } from '../../src/support/parabank-transaction-seeding';

function searchDate(value: string): string {
  const date = dateOnly(value);
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
}

test('find transaction by transaction ID', async ({ page, api, customer }) => {
  const account = await primaryAccount(api, customer.id);
  const [transaction] = await seedTransactions(api, account.id, { count: 1, amountForIndex: () => 3.41 });
  await signIn(page, customer);
  const search = new ParabankTransactionsPage(page);
  await search.findById(transaction.id);
  await search.expectTransactionVisible(transaction.id);
});

test('find transaction by transaction date', async ({ page, api, customer }) => {
  const account = await primaryAccount(api, customer.id);
  const [transaction] = await seedTransactions(api, account.id, { count: 1, amountForIndex: () => 3.42 });
  await signIn(page, customer);
  const search = new ParabankTransactionsPage(page);
  await search.findByDate(searchDate(transaction.date));
  await search.expectTransactionVisible(transaction.id);
});

test('find transactions within an inclusive date range', async ({ page, api, customer }) => {
  const account = await primaryAccount(api, customer.id);
  const [transaction] = await seedTransactions(api, account.id, { count: 1, amountForIndex: () => 3.43 });
  const date = searchDate(transaction.date);
  await signIn(page, customer);
  const search = new ParabankTransactionsPage(page);
  await search.findByDateRange(date, date);
  await search.expectTransactionVisible(transaction.id);
});

test('find transaction by exact amount', async ({ page, api, customer }) => {
  const account = await primaryAccount(api, customer.id);
  const amount = 3.44;
  const [transaction] = await seedTransactions(api, account.id, { count: 1, amountForIndex: () => amount });
  await signIn(page, customer);
  const search = new ParabankTransactionsPage(page);
  await search.findByAmount(amount.toFixed(2));
  await search.expectTransactionVisible(transaction.id);
});

const dateRangeEdges = [
  { name: 'start date equals end date', from: 'same', to: 'same', outcome: 'match' },
  { name: 'end date is earlier than start date', from: 'tomorrow', to: 'yesterday', outcome: 'empty' },
  { name: 'invalid date format', from: 'not-a-date', to: 'also-not-a-date', outcome: 'validation' },
  { name: 'future date', from: 'tomorrow', to: 'tomorrow', outcome: 'empty' }
] as const;

for (const scenario of dateRangeEdges) {
  test(`date range handles ${scenario.name}`, async ({ page, api, customer }) => {
    const account = await primaryAccount(api, customer.id);
    const [transaction] = await seedTransactions(api, account.id, { count: 1, amountForIndex: () => 3.45 });
    const today = dateOnly(transaction.date);
    const validToday = searchDate(transaction.date);
    const yesterdayDate = new Date(today);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const tomorrowDate = new Date(today);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const format = (date: Date) =>
      `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
    const from = scenario.from === 'same'
      ? validToday
      : scenario.from === 'tomorrow'
        ? format(tomorrowDate)
        : scenario.from;
    const to = scenario.to === 'same'
      ? validToday
      : scenario.to === 'yesterday'
        ? format(yesterdayDate)
        : scenario.to === 'tomorrow'
          ? format(tomorrowDate)
          : scenario.to;

    await signIn(page, customer);
    const search = new ParabankTransactionsPage(page);
    await search.findByDateRange(from, to);
    if (scenario.outcome === 'empty') {
      await search.expectNoResults();
    } else if (scenario.outcome === 'match') {
      await search.expectTransactionVisible(transaction.id);
    } else {
      await expect(page.locator('#dateRangeError')).toHaveText('Invalid date format');
    }
    await search.expectSearchPageUsable();
  });
}

test('amount search with no matching result shows an empty state', async ({ page, api, customer }) => {
  const account = await primaryAccount(api, customer.id);
  const existing = await api.getTransactionList(account.id);
  const amounts = new Set(existing.map(({ amount }) => amount.toFixed(2)));
  let unmatched = 9_999.99;
  while (amounts.has(unmatched.toFixed(2))) {
    unmatched -= 0.01;
  }
  await signIn(page, customer);
  const search = new ParabankTransactionsPage(page);
  await search.findByAmount(unmatched.toFixed(2));
  await search.expectNoResults();
});

test.describe('high-volume transaction history', () => {
  test.describe.configure({ timeout: 180_000 });

  let customer: Awaited<ReturnType<import('../../src/support/parabank-api').ParabankApi['createCustomer']>>;
  let accountId: string;
  let seededIds: string[];

  test.beforeAll(async ({ playwright }) => {
    const baseURL = process.env.PARABANK_BASE_URL || 'https://parabank.parasoft.com/parabank/';
    const request = await playwright.request.newContext({ baseURL });
    try {
      const { ParabankApi } = await import('../../src/support/parabank-api');
      const api = new ParabankApi(request);
      customer = await api.createCustomer();
      const account = (await api.getAccounts(customer.id))[0];
      if (!account) {
        throw new Error(`ParaBank customer ${customer.id} has no seed account`);
      }
      accountId = account.id;
      await api.deposit(accountId, 1_000);
      const seeded = await seedTransactions(api, accountId, {
        count: 55,
        amountForIndex: (index) => 1 + (index + 1) / 100
      });
      seededIds = seeded
        .map(({ id }) => id)
        .sort((left, right) => Number(left) - Number(right));
    } finally {
      await request.dispose();
    }
  });

  test('seed 55 transactions and find the newest transaction through UI search @api-only', async ({ page }) => {
    await signIn(page, customer);
    const search = new ParabankTransactionsPage(page);
    await search.findById(seededIds[seededIds.length - 1]);
    await search.expectTransactionVisible(seededIds[seededIds.length - 1]);
  });

  test('account activity displays the seeded transaction volume without losing rows @api-only', async ({ page }) => {
    await signIn(page, customer);
    const activity = new ParabankTransactionsPage(page);
    await activity.openActivity(accountId);
    await activity.expectActivityPage(accountId);
    const ids = await activity.allActivityTransactionIds();
    expect(ids.length).toBeGreaterThanOrEqual(55);
  });

  test('high-volume account activity lists the newest seeded transaction first @api-only', async ({ page, playwright }) => {
    const baseURL = process.env.PARABANK_BASE_URL || 'https://parabank.parasoft.com/parabank/';
    const request = await playwright.request.newContext({ baseURL });
    try {
      const { ParabankApi } = await import('../../src/support/parabank-api');
      const transactions = await new ParabankApi(request).getTransactionList(accountId);
      const newestSeededId = seededIds[seededIds.length - 1];
      await signIn(page, customer);
      const activity = new ParabankTransactionsPage(page);
      await activity.openActivity(accountId);
      await activity.expectActivityPage(accountId);
      const ids = await activity.allActivityTransactionIds();
      expect(ids.length).toBeGreaterThanOrEqual(55);
      expect(transactions.some(({ id }) => id === newestSeededId)).toBeTruthy();
      expect(new Set(ids).size).toBe(ids.length);
      test.fail(true, 'ParaBank account activity orders transactions oldest-first by date and ID');
      expect(ids[0]).toBe(newestSeededId);
    } finally {
      await request.dispose();
    }
  });
});

for (const accountIndex of [0, 1, 2]) {
  test(`account activity reconciles with the API for funded account ${accountIndex + 1}`, async ({ page, api, customer }) => {
    const accounts = await positiveAccounts(api, customer.id, 3);
    const account = accounts[accountIndex];
    await signIn(page, customer);
    const activity = new ParabankTransactionsPage(page);
    await activity.openActivity(account.id);
    await activity.expectActivityPage(account.id);
    const visibleIds = await activity.allActivityTransactionIds();
    const accountTransactions = await api.getTransactionList(account.id);
    for (const transaction of accountTransactions) {
      expect(visibleIds).toContain(transaction.id);
    }
  });
}
