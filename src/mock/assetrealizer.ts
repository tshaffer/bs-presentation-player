import {
  Asset,
  AssetPool,
  FailureReason,
} from '@brightsign/assetrealizer';

export default class AssetRealizer {
  constructor(assetPool: AssetPool, path: string) {
    return;
  }

  estimateRealizedSize(assets: Asset[]): Promise<number> {
    return Promise.resolve(2048);
  }

  realize(assets: Asset[]): Promise<FailureReason> {
    return Promise.resolve({
      name: '',
      ok: true,
      reason: '',
    });
  }

  validateFiles(assets: Asset[], options: string[]): Promise<string> {
    return Promise.resolve('');
  }
}