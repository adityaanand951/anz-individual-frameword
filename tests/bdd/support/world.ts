import { setWorldConstructor, World, type IWorldOptions } from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { ApiPage } from '../../../src/pages/api.page';
import { DashboardPage } from '../../../src/pages/dashboard.page';
import { HealthPage } from '../../../src/pages/health.page';
import { LoginPage } from '../../../src/pages/login.page';
import { ParabankApi, type ParabankCustomer } from '../../../src/support/parabank-api';
import type { APIRequestContext } from '@playwright/test';

export class BddWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  browserContext!: { request: any };
  loginPage!: LoginPage;
  dashboardPage!: DashboardPage;
  healthPage!: HealthPage;
  apiPage!: ApiPage;
  apiResponse!: any;
  parabankRequest!: APIRequestContext;
  parabankApi!: ParabankApi;
  parabankCustomer!: ParabankCustomer;
  parabankSourceAccountId!: string;
  parabankDestinationAccountId!: string;
  parabankSourceBalanceBefore!: number;
  parabankDestinationBalanceBefore!: number;
  parabankTransferAmount!: number;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(BddWorld);
