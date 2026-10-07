import { expect, type Locator, type Page } from '@playwright/test';

export class ParabankTransactionsPage {
  constructor(private readonly page: Page) {}

  async openSearch() {
    await this.page.getByRole('link', { name: /find transactions/i }).click();
  }

  async openActivity(accountId: string) {
    const url = new URL('activity.htm', this.page.url());
    url.searchParams.set('id', accountId);
    const activityResponse = this.page.waitForResponse((response) =>
      response.url().includes(`/services_proxy/bank/accounts/${accountId}/transactions/month/`)
    );
    await Promise.all([this.page.goto(url.toString()), activityResponse]);
  }

  async findById(transactionId: string) {
    await this.openSearch();
    await this.page.locator('#transactionId').fill(transactionId);
    await this.submit('#findById');
  }

  async findByDate(date: string) {
    await this.openSearch();
    await this.page.locator('#transactionDate').fill(date);
    await this.submit('#findByDate');
  }

  async findByDateRange(fromDate: string, toDate: string) {
    await this.openSearch();
    await this.page.locator('#fromDate').fill(fromDate);
    await this.page.locator('#toDate').fill(toDate);
    await this.submit('#findByDateRange');
  }

  async findByAmount(amount: string) {
    await this.openSearch();
    await this.page.locator('#amount').fill(amount);
    await this.submit('#findByAmount');
  }

  async submit(buttonSelector: '#findById' | '#findByDate' | '#findByDateRange' | '#findByAmount') {
    await this.page.locator(buttonSelector).click();
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
    await expect(
      this.resultTable.locator(`a[href*="transaction.htm?id=${transactionId}"]`)
    ).toBeVisible();
  }

  async expectNoResults() {
    const results = this.page.locator('#resultContainer');
    await expect(results).toBeVisible();
    await expect(this.resultRows).toHaveCount(0);
  }

  async expectSearchPageUsable() {
    await expect.poll(async () =>
      await this.page.locator('#formContainer').isVisible() ||
      await this.page.locator('#resultContainer').isVisible()
    ).toBeTruthy();
  }

  async expectActivityPage(accountId: string) {
    await expect(this.page).toHaveURL(new RegExp(`activity\\.htm\\?id=${accountId}`));
    await expect(this.resultTable).toBeVisible();
    await expect(this.page.locator('#accountId')).toHaveText(accountId);
  }

  async allActivityTransactionIds(): Promise<string[]> {
    const transactionLinks = this.resultTable.locator('a[href*="transaction.htm"]');
    const nextPage = this.page.getByRole('link', { name: /next/i });
    const ids: string[] = [];
    for (let pageNumber = 0; pageNumber < 100; pageNumber += 1) {
      const links = await transactionLinks.evaluateAll((anchors) =>
        anchors.map((anchor) => (anchor as HTMLAnchorElement).getAttribute('href') ?? '')
      );
      ids.push(...links
        .map((href) => href.match(/[?&]id=([^&]+)/)?.[1] ?? '')
        .filter(Boolean));
      if (!(await nextPage.count()) || !(await nextPage.isVisible()) || !(await nextPage.isEnabled())) {
        return ids;
      }
      await nextPage.click();
      await expect(this.resultRows.first()).toBeVisible();
    }
    throw new Error('ParaBank activity pagination exceeded 100 pages');
  }
}
