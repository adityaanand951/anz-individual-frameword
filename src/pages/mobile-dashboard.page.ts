import { expect } from '@wdio/globals';
import type { Browser } from 'webdriverio';

export class MobileDashboardPage {
  constructor(private readonly browser: Browser) {}

  async expectLoaded() {
    await expect(this.browser).toHaveTitle(/ACME|Dashboard/i);
  }

  async expectFinancialOverview() {
    await expect(this.browser.$('h6=Financial Overview')).toBeDisplayed();
    await expect(this.browser.$('=Total Balance')).toBeDisplayed();
    await expect(this.browser.$('=Credit Available')).toBeDisplayed();
    await expect(this.browser.$('=Due Today')).toBeDisplayed();
  }

  async expectRecentTransactions() {
    await expect(this.browser.$('h6=Recent Transactions')).toBeDisplayed();
    await expect(this.browser.$('table')).toBeDisplayed();
  }

  async expectMinimumTransactionRows(minimum: number) {
    await expect(this.browser.$$('table tbody tr')).toBeElementsArrayOfSize({ gte: minimum });
  }

  async expectTransaction(description: string) {
    await expect(this.browser.$(`table tbody tr*=${description}`)).toBeDisplayed();
  }

  async search(term: string) {
    await this.browser.$$('input[placeholder="Start typing to search..."]')[0].setValue(term);
  }

  async expectSearchValue(term: string) {
    await expect(this.browser.$$('input[placeholder="Start typing to search..."]')[0]).toHaveValue(term);
  }

  async expectQuickAction(action: string) {
    await expect(this.browser.$(`a*=${action}`)).toBeDisplayed();
  }

  async expectSidebarLink(link: string) {
    await expect(this.browser.$(`a*=${link}`)).toBeDisplayed();
  }
}
