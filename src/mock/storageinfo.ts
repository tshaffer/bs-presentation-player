import { StorageDeviceInfo } from '@brightsign/storageinfo';

export default class StorageInfo {
  constructor(path: string) {
    return;
  }

  getDeviceSize(): Promise<number> {
    return Promise.resolve(2048);
  }

  getDeviceInfo(): Promise<StorageDeviceInfo> {
    return Promise.resolve({ size: 2048 });
  }
}