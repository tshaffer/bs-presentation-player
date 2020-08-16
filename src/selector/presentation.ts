import { isNil, isString } from 'lodash';
import * as fs from 'fs-extra';
import isomorphicPath from 'isomorphic-path';

import {
  BsPpState, FileLUT, SyncSpecDownload, PpSchedule, SyncSpecFileMap, bsPpStateFromState, RuntimeEnvironment,
} from '../type';
import { DmState, dmFilterDmState, dmGetAssetItemListForFileName } from '@brightsign/bsdatamodel';
import { BsAssetItem } from '@brightsign/bscore';
import { Dimensions } from '../utility/utilities';
import AssetPool from '@brightsign/assetpool';

// ------------------------------------
// Selectors
// ------------------------------------
export function getRuntimeEnvironment(state: any): RuntimeEnvironment {

  const bsPpState: BsPpState = bsPpStateFromState(state);

  if (
    !isNil(bsPpState.bsPlayer)
    && !isNil(bsPpState.bsPlayer.presentationData)) {
    return bsPpState.bsPlayer.presentationData.runtimeEnvironment;
  }
  return RuntimeEnvironment.Dev;
}

export function getSrcDirectory(state: any): string {
  const bsPpState: BsPpState = bsPpStateFromState(state);
  if (
    !isNil(bsPpState.bsPlayer)
    && !isNil(bsPpState.bsPlayer.presentationData)
    && !isNil(bsPpState.bsPlayer.presentationData.srcDirectory)) {
    return bsPpState.bsPlayer.presentationData.srcDirectory;
  }
  return '';
}

export function getScreenDimensions(state: any): Dimensions {
  const bsPpState: BsPpState = bsPpStateFromState(state);
  if (
    !isNil(bsPpState.bsPlayer)
    && !isNil(bsPpState.bsPlayer.presentationData)
    && !isNil(bsPpState.bsPlayer.presentationData.screenDimensions)) {
    return bsPpState.bsPlayer.presentationData.screenDimensions;
  }
  return { width: 1920, height: 1080 };
}

export const getSyncSpecFileMap = (state: BsPpState): SyncSpecFileMap | null => {
  state = bsPpStateFromState(state);
  if (!isNil(state.bsPlayer)
    && !isNil(state.bsPlayer.presentationData)) {
    return state.bsPlayer.presentationData.syncSpecFileMap;
  }
  return null;
};

export const getAutoschedule = (state: any): PpSchedule | null => {

  const bsPpState: BsPpState = bsPpStateFromState(state);

  if (!isNil(bsPpState.bsPlayer)
    && !isNil(bsPpState.bsPlayer.presentationData)) {
    return bsPpState.bsPlayer.presentationData.autoSchedule;
  }
  return null;
};

function getPoolAssetFiles(state: BsPpState): FileLUT {
  state = bsPpStateFromState(state);

  const poolAssetFiles: FileLUT = {};

  const syncSpecFileMap = getSyncSpecFileMap(state);

  const rootDirectory = getSrcDirectory(state);

  if (!isNil(syncSpecFileMap) && isString(rootDirectory)) {
    for (const fileName in syncSpecFileMap) {
      if (syncSpecFileMap.hasOwnProperty(fileName)) {
        const syncSpecDownload: SyncSpecDownload = syncSpecFileMap[fileName];
        poolAssetFiles[fileName] = isomorphicPath.join(rootDirectory, syncSpecDownload.link);
      }
    }
  }

  return poolAssetFiles;
}

export function getPathFromAssetName(state: BsPpState, assetName: string): string {
  const bsdm: DmState = dmFilterDmState(state);
  const assetItems: BsAssetItem[] = dmGetAssetItemListForFileName(bsdm, { name: assetName });
  if (assetItems.length === 1) {
    const assetItem: BsAssetItem = assetItems[0];
    const filePath: string = isomorphicPath.join(assetItem.path, assetItem.name);
    return filePath;
  }
  return '';
}

export function getAssetPath(state: BsPpState, assetName: string): string {

  const runtimeEnvironment: RuntimeEnvironment = getRuntimeEnvironment(state);
  switch (runtimeEnvironment) {
    case RuntimeEnvironment.BaconPreview:
      return getPathFromAssetName(state, assetName);
    case RuntimeEnvironment.Dev:
      return getPoolFilePath(state, assetName);
    case RuntimeEnvironment.BrightSign:
      return getPoolFilePath(state, assetName);
    default:
      break;
  }
  return '';
}

function getPoolFilePath(state: BsPpState, fileName: string): string {
  state = bsPpStateFromState(state);
  return getPoolAssetFiles(state)[fileName];
}

export const getSyncSpecFile = (state: BsPpState, fileName: string): Promise<object> => {
  state = bsPpStateFromState(state);

  const syncSpecFileMap = getSyncSpecFileMap(state);
  if (isNil(syncSpecFileMap)) {
    return Promise.reject('No sync spec');
  }

  if (!(syncSpecFileMap as SyncSpecFileMap).hasOwnProperty(fileName)) {
    return Promise.reject('file not found');
  }
  const syncSpecFile: SyncSpecDownload = (syncSpecFileMap as SyncSpecFileMap)[fileName];

  const rootDirectory = getSrcDirectory(state);

  const filePath: string = isomorphicPath.join(rootDirectory, syncSpecFile.link);

  return fs.readFile(filePath, 'utf8')
    .then((fileStr: string) => {
      const file: object = JSON.parse(fileStr);
      return Promise.resolve(file);
    });
};

export function
  getSyncSpecReferencedFile(fileName: string, syncSpecFileMap: SyncSpecFileMap, rootPath: string): Promise<object> {

  if (!syncSpecFileMap.hasOwnProperty(fileName)) {
    return Promise.reject('file not found');
  }
  const syncSpecFile: SyncSpecDownload = syncSpecFileMap[fileName];

  // const fileSize = syncSpecFile.size;
  const filePath: string = isomorphicPath.join(rootPath, syncSpecFile.link);

  return fs.readFile(filePath, 'utf8')
    .then((fileStr: string) => {

      const file: object = JSON.parse(fileStr);

      // I have commented out the following code to allow hacking of files -
      // that is, overwriting files in the pool without updating the sync spec with updated sha1
      // if (fileSize !== fileStr.length) {
      //   debugger;
      // }
      return Promise.resolve(file);
    });
}

export function getFeedPoolDirectory(state: any): string {
  const rootDirectory = getSrcDirectory(state);
  return isomorphicPath.join(rootDirectory, 'feedPool');
}

export function getFeedPoolFilePath(state: any, hashValue: string): string {
  const feedPoolDirectory = getFeedPoolDirectory(state);
  const hashValueLength = hashValue.length;
  const dir1 = hashValue.substring(hashValueLength - 2, hashValueLength - 1);
  const dir2 = hashValue.substring(hashValueLength - 1, hashValueLength);
  // TEDTODO
  const feedFileName = 'nohash-' + hashValue;
  return isomorphicPath.join(feedPoolDirectory, dir1, dir2, feedFileName);
}

export function feedPoolFileExists(state: any, hashValue: string): string {
  const feedPoolDirectory = getFeedPoolDirectory(state);
  const hashValueLength = hashValue.length;
  const dir1 = hashValue.substring(hashValueLength - 2, hashValueLength - 1);
  const dir2 = hashValue.substring(hashValueLength - 1, hashValueLength);
  // TEDTODO
  const feedFileName = 'nohash-' + hashValue;
  const feedPoolPath: string = isomorphicPath.join(feedPoolDirectory, dir1, dir2, feedFileName);
  if (feedPoolPath !== '' && fs.existsSync(feedPoolPath)) {
    return feedPoolPath;
  }
  return '';
}

export function getFeedCacheRoot(state: any): string {
  const rootDirectory = getSrcDirectory(state);
  return isomorphicPath.join(rootDirectory, 'feed_cache');
}

export function getFeedAssetPool(state: any): AssetPool {
  const feedPoolDirectory = getFeedPoolDirectory(state);
  return new AssetPool(feedPoolDirectory);
}
