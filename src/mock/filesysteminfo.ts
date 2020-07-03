import { StorageStats } from '@brightsign/filesysteminfo';

export default class StorageInfo {

  constructor(path: string) {
    return;
  }

  isReadOnly(): Promise<boolean> {
    return Promise.resolve(false);
  }

  getFilesystemType(): Promise<string> {
    return Promise.resolve('');
  }

  getStatistics(): Promise<StorageStats> {
    return Promise.resolve({
      blockSize: 0,
      bytesFree: 2048,
      sizeBytes: 2048,
      filesFree: 2048,
      filesUsed: 0,
      isReadOnly: false,
    });
  }
}