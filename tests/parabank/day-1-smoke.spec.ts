import { ParabankLoginPage } from '../../src/pages/parabank/login.page';
import { ParabankRegistrationPage, type RegistrationFields } from '../../src/pages/parabank/registration.page';
import { ParabankApi } from '../../src/support/parabank-api';
import { test, expect } from './fixtures';
import { randomInt, randomUUID } from 'node:crypto';

test('customer login page exposes its required controls @smoke', async ({ page }) => {
  const login = new ParabankLoginPage(page);
  await login.goto();
  await login.expectLoginPage();
});

test('API-seeded customer can log in and reach account services @smoke', async ({ page, customer }) => {
  const login = new ParabankLoginPage(page);
  await login.goto();
  await login.login(customer.username, customer.password);
  await login.expectAuthenticated();
  await expect(page.getByRole('link', { name: 'Accounts Overview' })).toBeVisible();
});

const invalidCredentials = [
  { name: 'unknown username', username: `missing-${Date.now()}`, password: 'SomePassword!' },
  { name: 'incorrect password', username: 'john', password: 'not-the-password' },
  { name: 'blank username', username: '', password: 'SomePassword!' },
  { name: 'blank password', username: 'john', password: '' }
];

for (const credentials of invalidCredentials) {
  test(`login rejects ${credentials.name} @smoke`, async ({ page }) => {
    const login = new ParabankLoginPage(page);
    await login.goto();
    await login.login(credentials.username, credentials.password);
    await login.expectLoginRejected();
  });
}

test('registration page exposes all onboarding fields @smoke', async ({ page }) => {
  const registration = new ParabankRegistrationPage(page);
  await registration.goto();
  await registration.expectFormVisible();
  await expect(page.locator('#customerForm input')).toHaveCount(12);
});

test('new customer can register, autologin, and view the default account @smoke', async ({ page, request }) => {
  const registration = new ParabankRegistrationPage(page);
  const uniqueId = `autoui${randomInt(100_000_000, 1_000_000_000)}`;
  const password = `Banking-${uniqueId.slice(-8)}!`;
  const fields: RegistrationFields = {
    firstName: 'New',
    lastName: 'Customer',
    street: '1 Test Street',
    city: 'Sydney',
    state: 'NSW',
    zipCode: '2000',
    phoneNumber: '0299999999',
    ssn: String(randomInt(100_000_000, 1_000_000_000)),
    username: uniqueId,
    password,
    repeatedPassword: password
  };

  await registration.goto();
  await registration.register(fields);
  await expect(page).toHaveTitle(/Customer Created/);
  await expect(page.locator('#leftPanel')).toContainText(/Welcome/i);
  await expect(page.getByText(/Your account was created successfully\. You are now logged in\./i)).toBeVisible();
  const api = new ParabankApi(request);
  const customerId = await api.getCustomerId(fields.username, fields.password);
  const accounts = await api.getAccounts(customerId);
  expect(accounts.length).toBeGreaterThan(0);
  await page.getByRole('link', { name: 'Accounts Overview' }).click();
  await expect(page.locator('#accountTable')).toContainText(accounts[0].id);
  await expect(page.locator('#accountTable')).toContainText(accounts[0].balance.toFixed(2));
});
