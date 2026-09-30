import { setWorldConstructor, World, type IWorldOptions } from '@cucumber/cucumber';
import { MobileDashboardPage } from '../../../../src/pages/mobile-dashboard.page';
import { MobileLoginPage } from '../../../../src/pages/mobile-login.page';
import type { Browser } from 'webdriverio';

export class MobileBddWorld extends World {
  browser!: Browser;
  loginPage!: MobileLoginPage;
  dashboardPage!: MobileDashboardPage;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(MobileBddWorld);
