import { expect, type Page } from '@playwright/test';

export class HealthPage {
  constructor(private readonly page: Page) {}

  async expectReachable() {
    const response = await this.page.goto('/');
    expect(response, 'The ACME Demo endpoint did not return a response').not.toBeNull();
    expect(response?.ok(), 'The ACME Demo endpoint returned an unsuccessful response').toBeTruthy();
  }
}
