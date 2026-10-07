import { expect, test, type APIRequestContext, type APIResponse } from '@playwright/test';
import { ParabankApi, type ParabankCustomer } from '../../../src/support/parabank-api';
import { checkRateLimitResponse } from '../../../src/support/parabank-rate-limit';

const serviceNamespace = 'http://service.parabank.parasoft.com/';
const soapEndpoint = 'services/ParaBank';

let request: APIRequestContext;
let api: ParabankApi;
let customer: ParabankCustomer;
let seedAccountId: string;

async function checked(response: APIResponse, operation: string): Promise<APIResponse> {
  await checkRateLimitResponse(response, operation);
  return response;
}

async function get(path: string, operation = path): Promise<APIResponse> {
  return checked(await request.get(path), operation);
}

async function post(path: string, params: Record<string, string>, operation = path): Promise<APIResponse> {
  return checked(await request.post(path, { params }), operation);
}

function xmlTag(xml: string, tag: string): string | undefined {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return xml.match(new RegExp(`<(?:(?:[\\w.-]+):)?${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:(?:[\\w.-]+):)?${escaped}>`))?.[1];
}

function expectXmlResponse(response: APIResponse, body: string): void {
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toMatch(/xml/i);
  expect(body).toMatch(/^\s*<\?xml|^\s*</);
}

function soapEnvelope(operation: string, fields: Record<string, string>): string {
  const argumentsXml = Object.entries(fields)
    .map(([name, value]) => `<ser:${name}>${value}</ser:${name}>`)
    .join('');
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="${serviceNamespace}">` +
    `<soapenv:Header/><soapenv:Body><ser:${operation}>${argumentsXml}</ser:${operation}></soapenv:Body></soapenv:Envelope>`;
}

async function soap(operation: string, fields: Record<string, string>): Promise<{ response: APIResponse; body: string }> {
  const response = await checked(await request.post(soapEndpoint, {
    data: soapEnvelope(operation, fields),
    headers: {
      'content-type': 'text/xml; charset=utf-8',
      soapaction: ''
    }
  }), `SOAP ${operation}`);
  return { response, body: await response.text() };
}

async function billPay(accountId: string, amount: string): Promise<APIResponse> {
  return checked(await request.post('services/bank/billpay', {
    params: { accountId, amount },
    data: {
      name: 'Day Eight Utilities',
      address: { street: '1 Test Street', city: 'Sydney', state: 'NSW', zipCode: '2000' },
      phoneNumber: '0299999999',
      accountNumber: 99887766
    }
  }), 'bill payment');
}

async function transactionIds(accountId: string): Promise<string[]> {
  return (await api.getTransactionList(accountId)).map(({ id }) => id);
}

test.beforeAll(async ({ playwright }) => {
  const baseURL = process.env.PARABANK_BASE_URL || 'https://parabank.parasoft.com/parabank/';
  request = await playwright.request.newContext({ baseURL });
  api = new ParabankApi(request);
  customer = await api.createCustomer();
  const accounts = await api.getAccounts(customer.id);
  const seedAccount = accounts[0];
  if (!seedAccount) {
    throw new Error(`ParaBank customer ${customer.id} was created without a seed account`);
  }
  seedAccountId = seedAccount.id;
});

test.afterAll(async () => {
  await request?.dispose();
});

test('customer can be created and retrieved through the customer resource', async () => {
  const response = await get(`services/bank/customers/${customer.id}`, 'customer lookup');
  const body = await response.text();
  expectXmlResponse(response, body);
  expect(xmlTag(body, 'id')).toBe(customer.id);
  expect(xmlTag(body, 'firstName')).toBe(customer.registration.firstName);
});

test('customer account collection includes the registered seed account', async () => {
  const response = await get(`services/bank/customers/${customer.id}/accounts`, 'customer account lookup');
  const body = await response.text();
  expectXmlResponse(response, body);
  expect(body).toContain(`<id>${seedAccountId}</id>`);
});

test('customer can open a checking account', async () => {
  const account = await api.openAccount(customer.id, 'CHECKING', seedAccountId);
  expect(account.id).toMatch(/^\d+$/);
  expect(account.type).toBe('CHECKING');
});

test('customer can open a savings account', async () => {
  const account = await api.openAccount(customer.id, 'SAVINGS', seedAccountId);
  expect(account.id).toMatch(/^\d+$/);
  expect(account.type).toBe('SAVINGS');
});

test('account detail resource returns the requested account', async () => {
  const response = await get(`services/bank/accounts/${seedAccountId}`, 'account lookup');
  const body = await response.text();
  expectXmlResponse(response, body);
  expect(xmlTag(body, 'id')).toBe(seedAccountId);
});

test('deposit creates a queryable transaction', async () => {
  const amount = 2.19;
  await api.deposit(seedAccountId, amount);
  const transactions = await api.getTransactionList(seedAccountId);
  expect(transactions.some((transaction) => transaction.description.toLowerCase().includes('deposit') &&
    transaction.amount === amount)).toBeTruthy();
});

test('transactions collection exposes transaction identifiers and amounts', async () => {
  await api.deposit(seedAccountId, 1.23);
  const response = await get(`services/bank/accounts/${seedAccountId}/transactions`, 'transaction lookup');
  const body = await response.text();
  expectXmlResponse(response, body);
  expect(body).toMatch(/<transaction>/);
  expect(body).toMatch(/<amount>[^<]+<\/amount>/);
});

test('transfer debits and credits the selected accounts', async () => {
  const destination = await api.openAccount(customer.id, 'CHECKING', seedAccountId);
  const beforeSource = await api.getAccount(seedAccountId);
  const beforeDestination = await api.getAccount(destination.id);
  const result = await api.transfer(seedAccountId, destination.id, 1.31);
  expect(result.status).toBe(200);
  expect((await api.getAccount(seedAccountId)).balance).toBeCloseTo(beforeSource.balance - 1.31, 2);
  expect((await api.getAccount(destination.id)).balance).toBeCloseTo(beforeDestination.balance + 1.31, 2);
});

test('bill payment debits the account and records a bill payment transaction', async () => {
  const before = await api.getAccount(seedAccountId);
  const response = await billPay(seedAccountId, '1.17');
  expect(response.ok()).toBeTruthy();
  expect((await api.getAccount(seedAccountId)).balance).toBeCloseTo(before.balance - 1.17, 2);
  expect((await api.getTransactionList(seedAccountId)).some((transaction) =>
    transaction.description.toLowerCase().includes('day eight utilities'))).toBeTruthy();
});

test('unknown customer ID does not return a customer record', async () => {
  const response = await get('services/bank/customers/999999999', 'invalid customer lookup');
  const body = await response.text();
  expect(response.status() >= 400 || !/<customer(?:\s|>)/i.test(body)).toBeTruthy();
});

test('unknown account ID does not return an account record', async () => {
  const response = await get('services/bank/accounts/999999999', 'invalid account lookup');
  const body = await response.text();
  expect(response.status() >= 400 || !/<account(?:\s|>)/i.test(body)).toBeTruthy();
});

test('transactions for an unknown account are empty or rejected', async () => {
  const response = await get('services/bank/accounts/999999999/transactions', 'invalid transaction lookup');
  const body = await response.text();
  expect(response.status() >= 400 || !/<transaction>/i.test(body)).toBeTruthy();
});

test('transfer rejects missing required parameters', async () => {
  const response = await checked(await request.post('services/bank/transfer'), 'transfer with missing parameters');
  expect(response.status()).toBeGreaterThanOrEqual(400);
});

test('bill payment rejects missing required parameters', async () => {
  const response = await checked(await request.post('services/bank/billpay'), 'bill payment with missing parameters');
  expect(response.status()).toBeGreaterThanOrEqual(400);
});

test('JSON content type is not accepted as a transfer form and does not mutate balances', async () => {
  const destination = await api.openAccount(customer.id, 'CHECKING', seedAccountId);
  const beforeSource = (await api.getAccount(seedAccountId)).balance;
  const beforeDestination = (await api.getAccount(destination.id)).balance;
  const response = await checked(await request.post('services/bank/transfer', {
    data: { fromAccountId: seedAccountId, toAccountId: destination.id, amount: '1.00' },
    headers: { 'content-type': 'application/json' }
  }), 'JSON transfer payload');
  const body = await response.text();
  expect(response.status() >= 400 || !/transfer complete/i.test(body)).toBeTruthy();
  expect((await api.getAccount(seedAccountId)).balance).toBe(beforeSource);
  expect((await api.getAccount(destination.id)).balance).toBe(beforeDestination);
});

test('customer GET validates the customer XML schema', async () => {
  const response = await get(`services/bank/customers/${customer.id}`, 'customer schema lookup');
  const body = await response.text();
  expectXmlResponse(response, body);
  for (const field of ['id', 'firstName', 'lastName', 'address', 'city', 'state', 'zipCode']) {
    expect(xmlTag(body, field), `customer XML field ${field}`).toBeDefined();
  }
});

test('account GET validates the account XML schema', async () => {
  const response = await get(`services/bank/accounts/${seedAccountId}`, 'account schema lookup');
  const body = await response.text();
  expectXmlResponse(response, body);
  expect(xmlTag(body, 'id')).toBe(seedAccountId);
  expect(xmlTag(body, 'type')).toMatch(/^(CHECKING|SAVINGS)$/);
  expect(Number.isFinite(Number(xmlTag(body, 'balance')))).toBeTruthy();
});

test('transactions GET validates the transaction XML schema', async () => {
  await api.deposit(seedAccountId, 1.49);
  const response = await get(`services/bank/accounts/${seedAccountId}/transactions`, 'transaction schema lookup');
  const body = await response.text();
  expectXmlResponse(response, body);
  const transaction = body.match(/<(?:[\w.-]+:)?transaction(?:\s[^>]*)?>([\s\S]*?)<\/(?:[\w.-]+:)?transaction>/)?.[1];
  expect(transaction).toBeDefined();
  for (const field of ['id', 'accountId', 'type', 'date', 'amount', 'description']) {
    expect(xmlTag(transaction ?? '', field), `transaction XML field ${field}`).toBeDefined();
  }
});

test('SOAP getCustomer matches the REST customer record', async () => {
  const { response, body } = await soap('getCustomer', { customerId: customer.id });
  expect(response.ok()).toBeTruthy();
  expect(body).toContain('getCustomerResponse');
  expect(xmlTag(body, 'id')).toBe(customer.id);
  expect(body).not.toContain('Fault');
});

test('SOAP getAccount matches the REST account record', async () => {
  const { response, body } = await soap('getAccount', { accountId: seedAccountId });
  expect(response.ok()).toBeTruthy();
  expect(body).toContain('getAccountResponse');
  expect(xmlTag(body, 'id')).toBe(seedAccountId);
  expect(body).not.toContain('Fault');
});

test('SOAP getTransactions returns the REST account transactions', async () => {
  await api.deposit(seedAccountId, 1.47);
  const restIds = await transactionIds(seedAccountId);
  expect(restIds.length).toBeGreaterThan(0);
  const { response, body } = await soap('getTransactions', { accountId: seedAccountId });
  expect(response.ok()).toBeTruthy();
  expect(body).toContain('getTransactionsResponse');
  expect(body).not.toContain('Fault');
  expect(body).toContain(restIds[0]);
});

test('API end-to-end chain creates a customer, account, transfer, bill payment, and ledger entries', async () => {
  const chainCustomer = await api.createCustomer();
  const chainAccount = (await api.getAccounts(chainCustomer.id))[0];
  if (!chainAccount) {
    throw new Error(`ParaBank customer ${chainCustomer.id} has no seed account`);
  }
  const destination = await api.openAccount(chainCustomer.id, 'CHECKING', chainAccount.id);
  const beforeSource = (await api.getAccount(chainAccount.id)).balance;
  const beforeDestination = (await api.getAccount(destination.id)).balance;
  const transfer = await api.transfer(chainAccount.id, destination.id, 3.25);
  expect(transfer.status).toBe(200);
  const billResponse = await billPay(destination.id, '1.25');
  expect(billResponse.ok()).toBeTruthy();
  expect((await api.getAccount(chainAccount.id)).balance).toBeCloseTo(beforeSource - 3.25, 2);
  expect((await api.getAccount(destination.id)).balance).toBeCloseTo(beforeDestination + 2, 2);
  expect((await api.getTransactionList(chainAccount.id)).length).toBeGreaterThan(0);
  expect((await api.getTransactionList(destination.id)).length).toBeGreaterThan(0);
});
