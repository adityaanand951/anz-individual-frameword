import { expect, type Page } from '@playwright/test';

export class DashboardPage {
  readonly transactions;

  constructor(private readonly page: Page) {
    this.transactions = page.locator('[data-testid="transactions"], .transactions');
  }
  async expectLoaded() { await expect(this.page).toHaveTitle(/ACME|Dashboard/i); }
  async expectFinancialOverview() {
    await expect(this.page.getByRole('heading', { name: 'Financial Overview' })).toBeVisible();
    await expect(this.page.getByText('Total Balance', { exact: true })).toBeVisible();
    await expect(this.page.getByText('Credit Available', { exact: true })).toBeVisible();
    await expect(this.page.getByText('Due Today', { exact: true })).toBeVisible();
  }
  async expectRecentTransactions() {
    await expect(this.page.getByRole('heading', { name: 'Recent Transactions' })).toBeVisible();
    await expect(this.page.locator('table')).toBeVisible();
  }
  async transactionRows() {
    return this.page.locator('table tbody tr').count();
  }
  async expectMinimumTransactionRows(minimum: number) {
    await expect.poll(() => this.transactionRows()).toBeGreaterThanOrEqual(minimum);
  }
  async expectTransaction(description: string) {
    await expect(this.page.locator('table tbody tr').filter({ hasText: description })).toBeVisible();
  }
  async search(term: string) {
    const search = this.page.getByPlaceholder('Start typing to search...').first();
    await search.fill(term);
  }
  async expectSearchValue(term: string) {
    await expect(this.page.getByPlaceholder('Start typing to search...').first()).toHaveValue(term);
  }
  async expectQuickAction(label: string) {
    await expect(this.page.getByRole('link', { name: new RegExp(label, 'i') })).toBeVisible();
  }
  async expectSidebarLink(label: string) {
    await expect(this.page.getByRole('link', { name: new RegExp(label, 'i') })).toBeVisible();
  }
}
