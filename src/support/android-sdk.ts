import fs from 'node:fs';
import path from 'node:path';

export function configureAndroidSdkPath(): void {
  const sdkRoot = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!sdkRoot) {
    return;
  }

  const platformTools = path.join(sdkRoot, 'platform-tools');
  const adbPath = path.join(platformTools, process.platform === 'win32' ? 'adb.exe' : 'adb');
  if (!fs.existsSync(adbPath)) {
    throw new Error(`Android SDK was configured at ${sdkRoot}, but ADB was not found at ${adbPath}`);
  }

  const pathEntries = (process.env.PATH ?? '').split(path.delimiter);
  const requiredPaths = [platformTools, path.join(sdkRoot, 'emulator')];
  const missingPaths = requiredPaths.filter(
    (requiredPath) => !pathEntries.some((entry) => path.resolve(entry) === path.resolve(requiredPath))
  );

  if (missingPaths.length > 0) {
    process.env.PATH = [...missingPaths, ...pathEntries].join(path.delimiter);
  }
}
