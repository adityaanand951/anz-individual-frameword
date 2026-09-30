import dotenv from 'dotenv';
dotenv.config();

const host = process.env.APPIUM_HOST || '127.0.0.1';
const port = Number(process.env.APPIUM_PORT || 4723);
const deviceUdids = (process.env.ANDROID_DEVICE_UDIDS ||
  'emulator-5554,emulator-5556,emulator-5558')
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);
const avdNames = (process.env.ANDROID_AVD_NAMES ||
  'Pixel_10_Pro_Fold,Pixel_10_Pro,Pixel_6')
  .split(',')
  .map((name) => name.trim());

export const config = {
  runner: 'local',
  specs: ['./tests/mobile/**/*.e2e.ts'],
  maxInstances: 3,
  hostname: host,
  port,
  path: '/',
  framework: 'mocha',
  reporters: ['spec'],
  logLevel: 'warn',
  services: [
    ['appium', {
      command: 'appium',
      args: {
        address: host,
        port,
        allowInsecure: 'uiautomator2:chromedriver_autodownload'
      }
    }]
  ],
  capabilities: deviceUdids.map((udid, index) => ({
    platformName: 'Android',
    browserName: 'Chrome',
    'appium:deviceName': avdNames[index] || udid,
    'appium:udid': udid,
    'appium:automationName': 'UiAutomator2',
    'appium:noReset': true,
    'appium:chromedriverAutodownload': true,
    'appium:newCommandTimeout': 180
  })),
  mochaOpts: { timeout: 120000 }
};

export default config;
