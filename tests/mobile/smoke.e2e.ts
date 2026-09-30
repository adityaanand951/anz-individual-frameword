import { expect } from '@wdio/globals';

describe('ACME mobile smoke', () => {
  it('opens ACME Demo in the installed Chrome browser', async () => {
    await browser.url(process.env.BASE_URL || 'https://demo.applitools.com/');
    const username = await $('#username');
    await expect(username).toBeDisplayed();
    await expect(browser).toHaveTitle(/ACME|Demo/i);
  });
});
