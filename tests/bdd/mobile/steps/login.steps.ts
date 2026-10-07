import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@wdio/globals';
import { MobileBddWorld } from '../support/world';

Given('I open the ACME login page', async function (this: MobileBddWorld) {
  await this.loginPage.goto();
});

When('I sign in with username {string} and password {string}', async function (
  this: MobileBddWorld, username: string, password: string
) {
  await this.loginPage.login(username, password);
});

When('I sign in with the valid user credentials', async function (this: MobileBddWorld) {
  await this.loginPage.login();
});

Then('I should be on the dashboard', async function (this: MobileBddWorld) {
  await this.loginPage.expectDashboard();
});

Then('the dashboard should be loaded', async function (this: MobileBddWorld) {
  await this.dashboardPage.expectLoaded();
});

Then('the login page should be loaded', async function (this: MobileBddWorld) {
  await this.loginPage.expectLoaded();
});

Then('the mobile page title should identify ACME Demo', async function (this: MobileBddWorld) {
  await expect(this.browser).toHaveTitle(/ACME|Demo/i);
});

Then('the password field should be masked', async function (this: MobileBddWorld) {
  await this.loginPage.expectPasswordMasked();
});

Then('the sign in control should be enabled', async function (this: MobileBddWorld) {
  if (!(await this.loginPage.signIn.isEnabled())) {
    throw new Error('The sign in control is disabled');
  }
});

When('I select Remember Me', async function (this: MobileBddWorld) {
  await this.loginPage.setRememberMe(true);
});

When('I clear Remember Me', async function (this: MobileBddWorld) {
  await this.loginPage.setRememberMe(false);
});

Then('Remember Me should be selected', async function (this: MobileBddWorld) {
  await this.loginPage.expectRememberMe(true);
});

Then('Remember Me should not be selected', async function (this: MobileBddWorld) {
  await this.loginPage.expectRememberMe(false);
});

Then('the dashboard financial overview should be visible', async function (this: MobileBddWorld) {
  await this.loginPage.expectDashboard();
  await this.dashboardPage.expectFinancialOverview();
});

Then('recent transactions should be visible', async function (this: MobileBddWorld) {
  await this.loginPage.expectDashboard();
  await this.dashboardPage.expectRecentTransactions();
});

Then('there should be at least {int} transactions', async function (this: MobileBddWorld, minimum: number) {
  await this.dashboardPage.expectMinimumTransactionRows(minimum);
});

Then('the transaction {string} should be displayed', async function (this: MobileBddWorld, description: string) {
  await this.dashboardPage.expectTransaction(description);
});

When('I search for {string}', async function (this: MobileBddWorld, term: string) {
  await this.dashboardPage.search(term);
});

Then('the dashboard search should contain {string}', async function (this: MobileBddWorld, term: string) {
  await this.dashboardPage.expectSearchValue(term);
});

Then('the {string} quick action should be visible', async function (this: MobileBddWorld, action: string) {
  await this.dashboardPage.expectQuickAction(action);
});

Then('the {string} sidebar link should be visible', async function (this: MobileBddWorld, link: string) {
  await this.dashboardPage.expectSidebarLink(link);
});
