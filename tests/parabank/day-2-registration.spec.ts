import requiredFields from './data/registration-required-fields.json';
import { ParabankLoginPage } from '../../src/pages/parabank/login.page';
import { ParabankRegistrationPage, type RegistrationFields } from '../../src/pages/parabank/registration.page';
import { test, expect } from './fixtures';
import { randomInt } from 'node:crypto';
import { navigateParaBank } from '../../src/support/parabank-rate-limit';

function validRegistration(username = `autov${randomInt(100_000_000, 1_000_000_000)}`): RegistrationFields {
  return {
    firstName: 'Taylor',
    lastName: 'Tester',
    street: '20 Example Road',
    city: 'Melbourne',
    state: 'VIC',
    zipCode: '3000',
    phoneNumber: '0399999999',
    ssn: `${Math.floor(100000000 + Math.random() * 899999999)}`,
    username,
    password: 'Validation-123!',
    repeatedPassword: 'Validation-123!'
  };
}

for (const field of requiredFields as (keyof RegistrationFields)[]) {
  test(`registration rejects a blank ${field} field`, async ({ page }) => {
    if (field === 'phoneNumber') {
      test.fail(true, 'The public ParaBank demo currently accepts registration without a phone number');
    }
    const fields = validRegistration();
    fields[field] = '';
    const registration = new ParabankRegistrationPage(page);
    await registration.goto();
    await registration.register(fields);
    await expect(page).toHaveURL(/register\.htm/);
    await expect(page.locator('#customerForm')).toBeVisible();
  });
}

test('registration rejects a duplicate username', async ({ page, customer }) => {
  const registration = new ParabankRegistrationPage(page);
  await registration.goto();
  await registration.register({
    ...validRegistration(customer.username),
    password: customer.password,
    repeatedPassword: customer.password
  });
  await expect(page).toHaveURL(/register\.htm/);
  await expect(page.locator('body')).toContainText(/already exists|already taken|duplicate/i);
});

test('registration rejects mismatched passwords', async ({ page }) => {
  const registration = new ParabankRegistrationPage(page);
  await registration.goto();
  await registration.register({ ...validRegistration(), repeatedPassword: 'Different-Password!' });
  await expect(page).toHaveURL(/register\.htm/);
  await expect(page.locator('#customerForm')).toBeVisible();
});

const registrationPayloads = [
  { name: 'maximum-length name', firstName: 'A'.repeat(256) },
  { name: 'special characters', firstName: "O'Connor & Sons <Automation>" },
  { name: 'SQL injection-shaped input', firstName: "' OR '1'='1' --" },
  { name: 'XSS-shaped input', firstName: '<script>window.__parabankXss = true</script>' }
];

const isSharedPublicDemo = (process.env.PARABANK_BASE_URL ?? 'https://parabank.parasoft.com/parabank/')
  .includes('parabank.parasoft.com');

for (const payload of registrationPayloads) {
  test(`registration safely handles ${payload.name}`, async ({ page }) => {
    test.skip(
      isSharedPublicDemo && process.env.PARABANK_ENABLE_SECURITY_PAYLOADS !== 'true',
      'Security payload probes are opt-in for the shared public demo'
    );
    let scriptDialogOpened = false;
    page.on('dialog', async (dialog) => {
      scriptDialogOpened = true;
      await dialog.dismiss();
    });
    await page.addInitScript(() => {
      Object.defineProperty(window, '__parabankXss', { value: false, writable: true });
    });
    const registration = new ParabankRegistrationPage(page);
    await registration.goto();
    await registration.register({ ...validRegistration(), firstName: payload.firstName });
    await expect(page.locator('body')).not.toContainText('An internal error has occurred');
    expect(scriptDialogOpened).toBeFalsy();
    expect(await page.evaluate(() => Reflect.get(window, '__parabankXss'))).toBe(false);
  });
}

test('logout prevents browser-back access to the signed-in overview', async ({ page, customer }) => {
  const login = new ParabankLoginPage(page);
  await login.goto();
  await login.login(customer.username, customer.password);
  await login.expectAuthenticated();
  await page.getByRole('link', { name: 'Log Out' }).click();
  await page.goBack();
  await page.reload();
  await login.expectLoginPage();
  await expect(page.locator('#accountTable')).toBeHidden();
  await expect(page.getByRole('heading', { name: /accounts overview/i })).toBeHidden();
});

test('direct overview navigation after logout returns to login', async ({ page, customer }) => {
  const login = new ParabankLoginPage(page);
  await login.goto();
  await login.login(customer.username, customer.password);
  await login.expectAuthenticated();
  await page.getByRole('link', { name: 'Log Out' }).click();
  await navigateParaBank(page, 'overview.htm');
  await login.expectLoginPage();
  await expect(page.locator('#accountTable')).toBeHidden();
});
