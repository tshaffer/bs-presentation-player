import {
  Asset,
  ValidationOptions,
  ValidationResultList,
  QueryResultAssetList,
} from '@brightsign/assetpool';

export default class AssetPool {

  constructor(path: string) {
    return;
  }

  protectAssets(name: string, assets: Asset[]): Promise<void> {
    return Promise.resolve();
  }

   unprotectAssets(name: string): Promise<void> {
    return Promise.resolve();
  }

  reserveStorage(size: number): Promise<void> {
    return Promise.resolve();
  }

  setMaximumPoolSize(size: number): Promise<void> {
    return Promise.resolve();
  }

  getPoolSize(): Promise<number> {
    return Promise.resolve(2048);
  }

  validate(assets: Asset[], options: ValidationOptions): Promise<ValidationResultList> {
    return Promise.resolve({
      name: '',
      ok: true,
      reason: '',
    });
  }

  queryFiles(assets: Asset[]): Promise<QueryResultAssetList> {
    return Promise.resolve({
      name: '',
      present: true,
    });
  }

  areAssetsReady(assets: Asset[]): Promise<boolean> {
    return Promise.resolve(true);
  }
}
