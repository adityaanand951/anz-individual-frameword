import { expect, type Locator, type Page } from '@playwright/test';

export class ParabankTransactionsPage {
  constructor(private readonly page: Page) {}

  async openSearch() {
    await this.page.getByRole('link', { name: /find transactions/i }).click();
  }

  async openActivity(accountId: string) {
    const url = new URL('activity.htm', this.page.url());
    url.searchParams.set('id', accountId);
    await this.page.goto(url.toString());
  }

  async findById(transactionId: string) {
    await this.openSearch();
    await this.page.locator('#transactionId').fill(transactionId);
    await this.submit();
  }

  async findByDate(date: string) {
    await this.openSearch();
    await this.page.locator('#transactionDate').fill(date);
    await this.submit();
  }

  async findByDateRange(fromDate: string, toDate: string) {
    await this.openSearch();
    await this.page.locator('#fromDate').fill(fromDate);
    await this.page.locator('#toDate').fill(toDate);
    await this.submit();
  }

  async findByAmount(amount: string) {
    await this.openSearch();
    await this.page.locator('#amount').fill(amount);
    await this.submit();
  }

  async submit() {
    await this.page.getByRole('button', { name: /find transactions/i }).click();
  }

  async selectAccount(accountId: string) {
    const selector = this.page.locator('#accountId');
    if (await selector.count()) {
      await selector.selectOption(accountId);
    }
  }

  get resultTable(): Locator {
    return this.page.locator('#transactionTable');
  }

  get resultRows(): Locator {
    return this.resultTable.locator('tbody tr');
  }

  async expectTransactionVisible(transactionId: string) {
    await expect(this.resultTable).toContainText(transactionId);
  }

  async expectNoResults() {
    const table = this.resultTable;
    if (await table.count()) {
      await expect(table.locator('tbody tr')).toHaveCount(0);
      return;
    }
    await expect(this.page.locator('body')).toContainText(/no transactions|no results/i);
  }

  async expectSearchPageUsable() {
    await expect(this.page.locator('#transactionId')).toBeVisible();
    await expect(this.page.locator('#transactionDate')).toBeVisible();
    await expect(this.page.locator('#fromDate')).toBeVisible();
    await expect(this.page.locator('#toDate')).toBeVisible();
    await expect(this.page.locator('#amount')).toBeVisible();
  }

  async expectActivityPage(accountId: string) {
    await expect(this.page).toHaveURL(new RegExp(`activity\\.ht\\?id=${accountId}`));
    await expect(this.resultTable).toBeVisible();
  }

  async allActivityTransactionIds(): Promise<string[]> {
    const transactionLinks = this.resultTable.locator('a[href*="transaction.htm"]');
    const nextPage = this.page.getByRole('link', { name: /next/i });
    const ids: string[] = [];
    for (let pageNumber = 0; pageNumber < 100; pageNumber += 1) {
      ids.push(...(await transactionLinks.allTextContents()).map((id) => id.trim()).filter(Boolean));
      if (!(await nextPage.count()) || !(await nextPage.isVisible()) || !(await nextPage.isEnabled())) {
        return ids;
      }
      await nextPage.click();
      await expect(this.resultRows.first()).toBeVisible();
    }
    throw new Error('ParaBank activity pagination exceeded 100 pages');
  }
}
