import { expect, type Page } from '@playwright/test';

export type PayIdOutcome = 'SETTLED' | 'FAILED' | 'TIMEOUT';

export class PayIdSimulationPage {
  constructor(private readonly page: Page) {}

  async installMock(outcome: PayIdOutcome) {
    await this.page.route('https://payid.mock.test/', async (route) => {
      await route.fulfill({
        contentType: 'text/html',
        body: `<!doctype html><html><body>
          <h1>PayID payment</h1>
          <label>PayID <input id="payid" value="alex@example.test"></label>
          <label>Amount <input id="amount" value="25.00"></label>
          <button id="pay" type="button">Pay now</button>
          <p id="paymentStatus" role="status"></p>
          <script>
            document.querySelector('#pay').addEventListener('click', async () => {
              const status = document.querySelector('#paymentStatus');
              status.textContent = 'Processing';
              const response = await fetch('/api/npp/payments', {
                method: 'POST',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify({
                  payId: document.querySelector('#payid').value,
                  amount: document.querySelector('#amount').value
                })
              });
              const result = await response.json();
              status.textContent = result.status;
            });
          </script>
        </body></html>`
      });
    });
    await this.page.route('https://payid.mock.test/api/npp/payments', async (route) => {
      const payload = route.request().postDataJSON() as { payId?: string; amount?: string };
      if (!payload.payId || !payload.amount || Number(payload.amount) <= 0) {
        await route.fulfill({ status: 400, json: { status: 'FAILED', reason: 'INVALID_PAYMENT' } });
        return;
      }
      await route.fulfill({
        status: 200,
        json: {
          status: outcome,
          paymentId: `mock-${outcome.toLowerCase()}-001`,
          rail: 'SIMULATED_NPP'
        }
      });
    });
  }

  async goto() {
    await this.page.goto('https://payid.mock.test/');
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Pay now' }).click();
  }

  async expectOutcome(outcome: PayIdOutcome) {
    await expect(this.page.locator('#paymentStatus')).toHaveText(outcome);
  }
}
