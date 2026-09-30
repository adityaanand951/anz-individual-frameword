import type { ParabankTransaction, ParabankApi } from './parabank-api';

export type TransactionSeedOptions = {
  count: number;
  amountForIndex?: (index: number) => number;
};

export function dateOnly(value: string): Date {
  const date = /^\d+$/.test(value) ? new Date(Number(value)) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ParaBank transaction date: ${value}`);
  }
  return date;
}

export async function seedTransactions(
  api: ParabankApi,
  accountId: string,
  { count, amountForIndex = (index) => 0.01 + (index % 97) / 100 }: TransactionSeedOptions
): Promise<ParabankTransaction[]> {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`Transaction seed count must be a positive integer; received ${count}`);
  }

  const before = await api.getTransactionList(accountId);
  const existingIds = new Set(before.map(({ id }) => id));
  for (let index = 0; index < count; index += 1) {
    const amount = amountForIndex(index);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`Transaction seed amount at index ${index} must be positive and finite`);
    }
    await api.deposit(accountId, amount);
  }

  const seeded = (await api.getTransactionList(accountId))
    .filter(({ id }) => !existingIds.has(id));
  if (seeded.length !== count) {
    throw new Error(`Expected ${count} newly seeded transactions, found ${seeded.length}`);
  }
  return seeded;
}
