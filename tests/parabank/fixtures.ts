import { _android as android, test as base } from '@playwright/test';
import { ParabankApi, type ParabankCustomer } from '../../src/support/parabank-api';
import { isParaBankRateLimited } from '../../src/support/parabank-rate-limit';
import { configureAndroidSdkPath } from '../../src/support/android-sdk';

configureAndroidSdkPath();

type ParabankFixtures = {
  customer: ParabankCustomer;
  api: ParabankApi;
};

export const test = base.extend<ParabankFixtures>({
  page: async ({ page }, use, testInfo) => {
    const deviceSerial = testInfo.project.metadata.androidDeviceSerial;
    if (typeof deviceSerial !== 'string') {
      await use(page);
      return;
    }

    const devices = await android.devices();
    const device = devices.find((connectedDevice) => connectedDevice.serial() === deviceSerial);
    if (!device) {
      throw new Error(
        `Android device ${deviceSerial} is not connected to ADB; verify it with "adb devices"`
      );
    }

    await device.shell('am force-stop com.android.chrome');
    const context = await device.launchBrowser();
    try {
      await use(await context.newPage());
    } finally {
      try {
        await context.close();
      } finally {
        await device.close();
      }
    }
  },
  api: async ({ request }, use, testInfo) => {
    testInfo.skip(
      isParaBankRateLimited(),
      'ParaBank rate-limited an earlier request; skipping remaining tests to avoid repeated requests'
    );
    await use(new ParabankApi(request));
  },
  customer: async ({ api }, use) => {
    const customer = await api.createCustomer();
    const seedAccount = (await api.getAccounts(customer.id))[0];
    if (!seedAccount) {
      throw new Error(`ParaBank customer ${customer.id} was created without a seed account`);
    }
    await api.deposit(seedAccount.id, 10_000);
    await use(customer);
  }
});

export { expect } from '@playwright/test';
