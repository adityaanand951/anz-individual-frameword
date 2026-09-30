import { After, Before, setDefaultTimeout, type ITestCaseHookParameter } from '@cucumber/cucumber';
import { createContext, attachFailureScreenshot, launchBrowser } from './browser';
import { BddWorld } from './world';

setDefaultTimeout(120000);

Before(async function (this: BddWorld) {
  this.browser = await launchBrowser();
  this.context = await createContext(this.browser);
  this.page = await this.context.newPage();
  this.browserContext = this.context;
});

After(async function (this: BddWorld, scenario: ITestCaseHookParameter) {
  if (scenario.result?.status === 'FAILED' && this.page) {
    await attachFailureScreenshot(this.page, this.attach.bind(this), scenario.pickle.name);
  }

  await this.context?.close();
  await this.browser?.close();
});
