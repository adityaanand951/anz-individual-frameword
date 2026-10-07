import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { DashboardPage } from '../../../src/pages/dashboard.page';
import { HealthPage } from '../../../src/pages/health.page';
import { LoginPage } from '../../../src/pages/login.page';
import { BddWorld } from '../support/world';

Given('I open the ACME login page', async function (this: BddWorld) {
  this.loginPage = new LoginPage(this.page);
  this.dashboardPage = new DashboardPage(this.page);
  await this.loginPage.goto();
});

When(
  'I sign in with username {string} and password {string}',
  async function (this: BddWorld, username: string, password: string) {
    await this.loginPage.login(username, password);
  }
);

When('I sign in with the valid user credentials', async function (this: BddWorld) {
  await this.loginPage.login();
});

Then('I should be on the dashboard', async function (this: BddWorld) {
  await this.loginPage.expectDashboard();
});

Then('the dashboard should be loaded', async function (this: BddWorld) {
  await this.dashboardPage.expectLoaded();
});

Then('the login page should be loaded', async function (this: BddWorld) {
  await this.loginPage.expectLoaded();
});

Then('the password field should be masked', async function (this: BddWorld) {
  await this.loginPage.expectPasswordMasked();
});

Then('the sign in control should be enabled', async function (this: BddWorld) {
  await this.loginPage.signIn.isEnabled().then((enabled) => {
    if (!enabled) throw new Error('The sign in control is disabled');
  });
});

Then('the username field should have an accessible identifier', async function (this: BddWorld) {
  await expect(this.loginPage.username).toHaveAttribute('id', 'username');
});

When('I select Remember Me', async function (this: BddWorld) {
  await this.loginPage.setRememberMe(true);
});

When('I clear Remember Me', async function (this: BddWorld) {
  await this.loginPage.setRememberMe(false);
});

Then('Remember Me should be selected', async function (this: BddWorld) {
  await this.loginPage.expectRememberMe(true);
});

Then('Remember Me should not be selected', async function (this: BddWorld) {
  await this.loginPage.expectRememberMe(false);
});

Then('the dashboard financial overview should be visible', async function (this: BddWorld) {
  await this.loginPage.expectDashboard();
  await this.dashboardPage.expectFinancialOverview();
});

Then('recent transactions should be visible', async function (this: BddWorld) {
  await this.loginPage.expectDashboard();
  await this.dashboardPage.expectRecentTransactions();
});

Then('there should be at least {int} transactions', async function (this: BddWorld, minimum: number) {
  await this.dashboardPage.expectMinimumTransactionRows(minimum);
});

Then('the transaction {string} should be displayed', async function (this: BddWorld, description: string) {
  await this.dashboardPage.expectTransaction(description);
});

When('I search for {string}', async function (this: BddWorld, term: string) {
  await this.dashboardPage.search(term);
});

Then('the dashboard search should contain {string}', async function (this: BddWorld, term: string) {
  await this.dashboardPage.expectSearchValue(term);
});

Then('the {string} quick action should be visible', async function (this: BddWorld, action: string) {
  await this.dashboardPage.expectQuickAction(action);
});

Then('the {string} sidebar link should be visible', async function (this: BddWorld, link: string) {
  await this.dashboardPage.expectSidebarLink(link);
});

Given('I check the ACME Demo endpoint', async function (this: BddWorld) {
  this.healthPage = new HealthPage(this.page);
});

Then('the ACME Demo endpoint should be reachable', async function (this: BddWorld) {
  await this.healthPage.expectReachable();
});
