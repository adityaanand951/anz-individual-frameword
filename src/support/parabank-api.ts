import { expect, type APIRequestContext } from '@playwright/test';
import { randomInt } from 'node:crypto';
import type { ParabankAccountType } from '../pages/parabank/accounts.page';
import type { RegistrationFields } from '../pages/parabank/registration.page';
import { checkRateLimitResponse, throwIfRateLimited } from './parabank-rate-limit';

export type ParabankCustomer = {
  id: string;
  username: string;
  password: string;
  registration: RegistrationFields;
};

export type ParabankAccount = {
  id: string;
  type: ParabankAccountType;
  balance: number;
};

export type ParabankTransaction = {
  id: string;
  accountId: string;
  type: string;
  date: string;
  amount: number;
  description: string;
};

function xmlValue(xml: string, name: string): string {
  const match = xml.match(new RegExp(`<${name}>([^<]*)</${name}>`));
  if (!match) {
    throw new Error(`Expected <${name}> in ParaBank XML response`);
  }
  return match[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function optionalXmlValue(xml: string, name: string): string {
  const match = xml.match(new RegExp(`<${name}>([^<]*)</${name}>`));
  return match?.[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'") ?? '';
}

function parseAccounts(xml: string): ParabankAccount[] {
  return Array.from(xml.matchAll(/<account>([\s\S]*?)<\/account>/g), ([, item]) => ({
    id: xmlValue(item, 'id'),
    type: xmlValue(item, 'type') as ParabankAccountType,
    balance: Number(xmlValue(item, 'balance'))
  }));
}

export function parseTransactions(xml: string): ParabankTransaction[] {
  return Array.from(xml.matchAll(/<transaction>([\s\S]*?)<\/transaction>/g), ([, item]) => {
    const transaction: ParabankTransaction = {
      id: xmlValue(item, 'id'),
      accountId: optionalXmlValue(item, 'accountId'),
      type: optionalXmlValue(item, 'type'),
      date: xmlValue(item, 'date'),
      amount: Number(xmlValue(item, 'amount')),
      description: optionalXmlValue(item, 'description')
    };
    if (!Number.isFinite(transaction.amount)) {
      throw new Error(`ParaBank transaction ${transaction.id} has an invalid amount`);
    }
    return transaction;
  });
}

export class ParabankApi {
  private static nextId = 0;

  constructor(private readonly request: APIRequestContext) {}

  async createCustomer(): Promise<ParabankCustomer> {
    const id = `${randomInt(100_000_000, 1_000_000_000)}${ParabankApi.nextId++}`;
    const registration: RegistrationFields = {
      firstName: 'Automation',
      lastName: `Customer${id.slice(-6)}`,
      street: '1 Test Street',
      city: 'Sydney',
      state: 'NSW',
      zipCode: '2000',
      phoneNumber: '0299999999',
      ssn: String(randomInt(100_000_000, 1_000_000_000)),
      username: `anz${id}`,
      password: `Banking-${id.slice(-8)}!`,
      repeatedPassword: `Banking-${id.slice(-8)}!`
    };

    const registrationPage = await this.request.get('register.htm');
    await checkRateLimitResponse(registrationPage, 'registration page request');
    if (!registrationPage.ok()) {
      throw new Error(`ParaBank registration page setup failed (${registrationPage.status()})`);
    }
    const response = await this.request.post('register.htm', {
      form: {
        'customer.firstName': registration.firstName,
        'customer.lastName': registration.lastName,
        'customer.address.street': registration.street,
        'customer.address.city': registration.city,
        'customer.address.state': registration.state,
        'customer.address.zipCode': registration.zipCode,
        'customer.phoneNumber': registration.phoneNumber,
        'customer.ssn': registration.ssn,
        'customer.username': registration.username,
        'customer.password': registration.password,
        repeatedPassword: registration.repeatedPassword
      }
    });
    await checkRateLimitResponse(response, 'customer registration');
    if (!response.ok()) {
      const responseBody = await response.text();
      const formError = responseBody.match(/<td[^>]*class="error"[^>]*>(.*?)<\/td>/is)?.[1]?.replace(/<[^>]+>/g, '').trim();
      throw new Error(`ParaBank customer setup failed (${response.status()})${formError ? `: ${formError}` : ''}`);
    }

    const customerResponse = await this.getCustomerResponse(registration.username, registration.password);
    await checkRateLimitResponse(customerResponse, 'customer lookup');
    expect(customerResponse.ok(), `ParaBank customer lookup failed (${customerResponse.status()})`).toBeTruthy();
    const customerXml = await customerResponse.text();
    return { id: xmlValue(customerXml, 'id'), username: registration.username, password: registration.password, registration };
  }

  async getCustomerId(username: string, password: string): Promise<string> {
    const response = await this.getCustomerResponse(username, password);
    await checkRateLimitResponse(response, 'customer lookup');
    expect(response.ok(), `ParaBank customer lookup failed (${response.status()})`).toBeTruthy();
    return xmlValue(await response.text(), 'id');
  }

  async getAccounts(customerId: string): Promise<ParabankAccount[]> {
    const response = await this.request.get(`services/bank/customers/${customerId}/accounts`);
    await checkRateLimitResponse(response, 'account lookup');
    const body = await response.text();
    expect(response.ok(), `ParaBank account lookup failed (${response.status()}): ${body}`).toBeTruthy();
    return parseAccounts(body);
  }

  async getAccount(accountId: string): Promise<ParabankAccount> {
    const response = await this.request.get(`services/bank/accounts/${accountId}`);
    await checkRateLimitResponse(response, 'account lookup');
    expect(response.ok(), `ParaBank account lookup failed (${response.status()})`).toBeTruthy();
    const body = await response.text();
    return {
      id: xmlValue(body, 'id'),
      type: xmlValue(body, 'type') as ParabankAccountType,
      balance: Number(xmlValue(body, 'balance'))
    };
  }

  async getTransactions(accountId: string): Promise<string> {
    const response = await this.request.get(`services/bank/accounts/${accountId}/transactions`);
    await checkRateLimitResponse(response, 'transaction lookup');
    expect(response.ok(), `ParaBank transaction lookup failed (${response.status()})`).toBeTruthy();
    return response.text();
  }

  async getTransactionList(accountId: string): Promise<ParabankTransaction[]> {
    return parseTransactions(await this.getTransactions(accountId));
  }

  async getTransaction(accountId: string, transactionId: string): Promise<ParabankTransaction> {
    const transactions = await this.getTransactionList(accountId);
    const transaction = transactions.find((item) => item.id === transactionId);
    if (!transaction) {
      throw new Error(`ParaBank transaction ${transactionId} was not found in account ${accountId}`);
    }
    return transaction;
  }

  async openAccount(customerId: string, type: ParabankAccountType, sourceAccountId: string): Promise<ParabankAccount> {
    const response = await this.request.post('services/bank/createAccount', {
      params: {
        customerId,
        newAccountType: type === 'CHECKING' ? '0' : '1',
        fromAccountId: sourceAccountId
      }
    });
    await checkRateLimitResponse(response, 'account creation');
    expect(response.ok(), `ParaBank account creation failed (${response.status()})`).toBeTruthy();
    const body = await response.text();
    return {
      id: xmlValue(body, 'id'),
      type: xmlValue(body, 'type') as ParabankAccountType,
      balance: Number(xmlValue(body, 'balance'))
    };
  }

  async transfer(fromAccountId: string, toAccountId: string, amount: number) {
    const response = await this.request.post('services/bank/transfer', {
      params: { fromAccountId, toAccountId, amount: amount.toFixed(2) }
    });
    const body = await response.text();
    throwIfRateLimited(response.status(), body, 'fund transfer');
    return { status: response.status(), body };
  }

  async deposit(accountId: string, amount: number) {
    const response = await this.request.post('services/bank/deposit', {
      params: { accountId, amount: amount.toFixed(2) }
    });
    await checkRateLimitResponse(response, 'account deposit');
    expect(response.ok(), `ParaBank deposit failed (${response.status()})`).toBeTruthy();
  }

  async requestLoan(customerId: string, amount: number, downPayment: number, fromAccountId: string) {
    const response = await this.request.post('services/bank/requestLoan', {
      params: {
        customerId,
        amount: amount.toFixed(2),
        downPayment: downPayment.toFixed(2),
        fromAccountId
      }
    });
    const body = await response.text();
    throwIfRateLimited(response.status(), body, 'loan request');
    return { status: response.status(), body };
  }

  async withdraw(accountId: string, amount: number) {
    const response = await this.request.post('services/bank/withdraw', {
      params: { accountId, amount: amount.toFixed(2) }
    });
    const body = await response.text();
    throwIfRateLimited(response.status(), body, 'account withdrawal');
    return { status: response.status(), body };
  }

  private getCustomerResponse(username: string, password: string) {
    return this.request.get(
      `services/bank/login/${encodeURIComponent(username)}/${encodeURIComponent(password)}`
    );
  }
}
