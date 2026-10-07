import AxeBuilder from '@axe-core/playwright';
import { ParabankAccountsPage } from '../../src/pages/parabank/accounts.page';
import { ParabankBillPayPage } from '../../src/pages/parabank/bill-pay.page';
import { ParabankLoginPage } from '../../src/pages/parabank/login.page';
import { PayIdSimulationPage, type PayIdOutcome } from '../../src/pages/parabank/payid-simulation.page';
import { ParabankTransferPage } from '../../src/pages/parabank/transfer.page';
import { test, expect } from './fixtures';
import { primaryAccount, signIn } from './helpers';

test('cross-channel smoke: customer can log in', async ({ page, customer }) => {
  await signIn(page, customer);
  await expect(page.locator('#leftPanel')).toContainText(/Welcome/i);
});

test('cross-channel smoke: customer can view Accounts Overview', async ({ page, customer }) => {
  await signIn(page, customer);
  await new ParabankAccountsPage(page).openOverview();
  await expect(page.getByRole('heading', { name: /accounts overview/i })).toBeVisible();
});

test('cross-channel smoke: customer can transfer between own accounts', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  const destination = await api.openAccount(customer.id, 'CHECKING', source.id);
  await signIn(page, customer);
  const transfer = new ParabankTransferPage(page);
  await transfer.transfer(source.id, destination.id, '1.00');
  await expect(page.locator('#showResult')).toContainText(/transfer complete/i);
});

test('cross-channel smoke: customer can pay a bill', async ({ page, api, customer }) => {
  const source = await primaryAccount(api, customer.id);
  await signIn(page, customer);
  const billPay = new ParabankBillPayPage(page);
  await billPay.submit({
    name: 'Channel Smoke Biller',
    street: '1 Test Street',
    city: 'Sydney',
    state: 'NSW',
    zipCode: '2000',
    phoneNumber: '0299999999',
    account: '90000001',
    verifyAccount: '90000001',
    amount: '1.00'
  }, source.id);
  await billPay.expectConfirmation('Channel Smoke Biller');
});

test('cross-channel smoke: logout hides authenticated account links', async ({ page, customer }) => {
  await signIn(page, customer);
  await page.getByRole('link', { name: 'Log Out' }).click();
  await expect(page.getByRole('heading', { name: 'Customer Login' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Accounts Overview' })).toHaveCount(0);
});

test('keyboard navigation reaches login controls in order', async ({ page }) => {
  const login = new ParabankLoginPage(page);
  await login.goto();
  await expect(page.locator('input[name="username"]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('input[name="password"]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /log in/i })).toBeFocused();
});

test('mobile login layout keeps form controls inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const login = new ParabankLoginPage(page);
  await login.goto();
  const bounds = await page.locator('#loginPanel').boundingBox();
  if (!bounds) {
    throw new Error('Login panel did not have a visible bounding box');
  }
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  await expect(page.locator('input[name="username"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
});

test('Accounts Overview table exposes account and balance headings', async ({ page, customer }) => {
  await signIn(page, customer);
  await new ParabankAccountsPage(page).openOverview();
  await expect(page.locator('#accountTable')).toBeVisible();
  await expect(page.locator('#accountTable thead')).toContainText(/Account/);
  await expect(page.locator('#accountTable thead')).toContainText(/Balance/);
});

test('Bill Pay form exposes all required payee fields', async ({ page, customer }) => {
  await signIn(page, customer);
  await new ParabankBillPayPage(page).open();
  for (const field of [
    'payee.name',
    'payee.address.street',
    'payee.address.city',
    'payee.address.state',
    'payee.address.zipCode',
    'payee.phoneNumber',
    'payee.accountNumber',
    'verifyAccount',
    'amount'
  ]) {
    await expect(page.locator(`input[name="${field}"]`)).toBeVisible();
  }
});

for (const pageName of ['login', 'overview', 'transfer'] as const) {
  test(`accessibility scan: record ${pageName} page violations`, async ({ page, customer }) => {
    const login = new ParabankLoginPage(page);
    await login.goto();
    if (pageName !== 'login') {
      await login.login(customer.username, customer.password);
      await login.expectAuthenticated();
    }
    if (pageName === 'overview') {
      await new ParabankAccountsPage(page).openOverview();
    } else if (pageName === 'transfer') {
      await new ParabankTransferPage(page).open();
    }

    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter((violation) => violation.impact === 'critical');
    await test.info().attach(`axe-${pageName}-violations`, {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json'
    });
    if (results.violations.length > 0) {
      test.info().annotations.push({
        type: 'accessibility-violations',
        description: `${results.violations.length} violations recorded; ${critical.length} critical`
      });
    }
  });
}

for (const outcome of ['SETTLED', 'FAILED', 'TIMEOUT'] satisfies PayIdOutcome[]) {
  test(`@payid-mock simulated PayID/NPP payment handles ${outcome.toLowerCase()} response`, async ({ page }) => {
    const payId = new PayIdSimulationPage(page);
    await payId.installMock(outcome);
    await payId.goto();
    await payId.submit();
    await payId.expectOutcome(outcome);
  });
}
