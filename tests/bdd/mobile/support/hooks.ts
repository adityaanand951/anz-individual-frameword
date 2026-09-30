import { After, Before, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { remote } from 'webdriverio';
import type { ChildProcess } from 'node:child_process';
import { spawn } from 'node:child_process';
import { MobileBddWorld } from './world';

let appium: ChildProcess | undefined;
setDefaultTimeout(120000);

BeforeAll(async function () {
  const appiumCommand = [
    'npx appium',
    `--address ${process.env.APPIUM_HOST || '127.0.0.1'}`,
    `--port ${process.env.APPIUM_PORT || '4723'}`,
    '--allow-insecure uiautomator2:chromedriver_autodownload'
  ].join(' ');
  appium = spawn(appiumCommand, { shell: true, stdio: 'ignore' });
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://${process.env.APPIUM_HOST || '127.0.0.1'}:${process.env.APPIUM_PORT || '4723'}/status`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  appium.kill();
  throw new Error('Appium did not become ready within 30 seconds');
});

Before(async function (this: MobileBddWorld) {
  const udid = process.env.BDD_DEVICE_UDID;
  if (!udid) throw new Error('BDD_DEVICE_UDID is required for mobile BDD execution');
  this.browser = await remote({
    hostname: process.env.APPIUM_HOST || '127.0.0.1',
    port: Number(process.env.APPIUM_PORT || 4723),
    path: '/',
    capabilities: {
      platformName: 'Android',
      browserName: 'Chrome',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': udid,
      'appium:udid': udid,
      'appium:noReset': true,
      'appium:newCommandTimeout': 180
    }
  });
  this.loginPage = new (await import('../../../../src/pages/mobile-login.page')).MobileLoginPage(this.browser);
  this.dashboardPage = new (await import('../../../../src/pages/mobile-dashboard.page')).MobileDashboardPage(this.browser);
});

After(async function (this: MobileBddWorld) {
  await this.browser?.deleteSession();
});

AfterAll(async function () {
  appium?.kill();
});
