import { isNil, isString } from 'lodash';
import * as fs from 'fs-extra';
import isomorphicPath from 'isomorphic-path';

import {
  BsPpState, RawSyncSpec, FileLUT, SyncSpecDownload, PpSchedule, SyncSpecFileMap,
} from '../type';

// ------------------------------------
// Selectors
// ------------------------------------
export function getPresentationPlatform(state: BsPpState): string {
  if (
    !isNil(state.bsPlayer)
    && !isNil(state.bsPlayer.presentationData)
    && !isNil(state.bsPlayer.presentationData.platform)) {
    return state.bsPlayer.presentationData.platform;
  }
  return '';
}

export function getSrcDirectory(state: BsPpState): string {
  if (
    !isNil(state.bsPlayer)
    && !isNil(state.bsPlayer.presentationData)
    && !isNil(state.bsPlayer.presentationData.srcDirectory)) {
    return state.bsPlayer.presentationData.srcDirectory;
  }
  return '';
}

export const getSyncSpecFileMap = (state: BsPpState): SyncSpecFileMap | null => {
  if (!isNil(state.bsPlayer)
    && !isNil(state.bsPlayer.presentationData)) {
    return state.bsPlayer.presentationData.syncSpecFileMap;
  }
  return null;
};

export const getAutoschedule = (state: BsPpState): PpSchedule | null => {
  if (!isNil(state.bsPlayer)
    && !isNil(state.bsPlayer.presentationData)) {
    return state.bsPlayer.presentationData.autoSchedule;
  }
  return null;
};

export function getPoolAssetFiles(state: BsPpState): FileLUT {

  const poolAssetFiles: FileLUT = {};

  const syncSpecFileMap = getSyncSpecFileMap(state);
  const rootDirectory = getSrcDirectory(state);

  if (!isNil(syncSpecFileMap) && isString(rootDirectory) && rootDirectory.length > 0) {
    for (const fileName in syncSpecFileMap) {
      if (syncSpecFileMap.hasOwnProperty(fileName)) {
        const syncSpecDownload: SyncSpecDownload = syncSpecFileMap[fileName];
        poolAssetFiles[fileName] = isomorphicPath.join(rootDirectory, syncSpecDownload.link);
      }
    }
  }

  return poolAssetFiles;
}

export function getPoolFilePath(state: BsPpState, fileName: string): string {
  return getPoolAssetFiles(state)[fileName];
}

export const getSyncSpecFile = (state: BsPpState, fileName: string): Promise<object> => {

  const syncSpecFileMap = getSyncSpecFileMap(state);
  if (isNil(syncSpecFileMap)) {
    return Promise.reject('No sync spec');
  }

  if (!syncSpecFileMap.hasOwnProperty(fileName)) {
    return Promise.reject('file not found');
  }
  const syncSpecFile: SyncSpecDownload = syncSpecFileMap[fileName];

  const rootDirectory = getSrcDirectory(state);

  const filePath: string = isomorphicPath.join(rootDirectory, syncSpecFile.link);

  return fs.readFile(filePath, 'utf8')
    .then((fileStr: string) => {
      const file: object = JSON.parse(fileStr);
      return Promise.resolve(file);
    });
};

export function getFile(syncSpec: RawSyncSpec, fileName: string): SyncSpecDownload | null {

  let file: SyncSpecDownload | null = null;

  // TEDTODO - use map instead of array
  syncSpec.files.download.forEach((syncSpecFile: SyncSpecDownload) => {
    if (syncSpecFile.name === fileName) {
      file = syncSpecFile;
      return;
    }
  });

  return file;
}

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
