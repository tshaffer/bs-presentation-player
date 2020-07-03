import { isNil, isString } from 'lodash';
import * as fs from 'fs-extra';
import isomorphicPath from 'isomorphic-path';

import {
  BsPpState, ArSyncSpec, ArFileLUT, ArSyncSpecDownload, PpSchedule,
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

export const getSyncSpec = (state: BsPpState): ArSyncSpec | null => {
  if (!isNil(state.bsPlayer)
    && !isNil(state.bsPlayer.presentationData)) {
    return state.bsPlayer.presentationData.syncSpec;
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

export function getPoolAssetFiles(state: BsPpState): ArFileLUT {

  const poolAssetFiles: ArFileLUT = {};

  const syncSpec = getSyncSpec(state);
  const rootDirectory = getSrcDirectory(state);

  if (!isNil(syncSpec) && isString(rootDirectory) && rootDirectory.length > 0) {
    syncSpec.files.download.forEach((syncSpecFile: ArSyncSpecDownload) => {
      poolAssetFiles[syncSpecFile.name] = isomorphicPath.join(rootDirectory, syncSpecFile.link);
    });
  }

  return poolAssetFiles;
}

export function getPoolFilePath(state: BsPpState, fileName: string): string {
  return getPoolAssetFiles(state)[fileName];
}

export const getSyncSpecFile = (state: BsPpState, fileName: string): Promise<object> => {

  const syncSpec = getSyncSpec(state);
  if (isNil(syncSpec)) {
    return Promise.reject('No sync spec');
  }

  const syncSpecFile: ArSyncSpecDownload | null = getFile(syncSpec, fileName);
  if (syncSpecFile == null) {
    return Promise.reject('file not found');
  }

  const rootDirectory = getSrcDirectory(state);

  const filePath: string = isomorphicPath.join(rootDirectory, syncSpecFile.link);

  return fs.readFile(filePath, 'utf8')
    .then((fileStr: string) => {
      const file: object = JSON.parse(fileStr);
      return Promise.resolve(file);
    });
};

export function getFile(syncSpec: ArSyncSpec, fileName: string): ArSyncSpecDownload | null {

  let file: ArSyncSpecDownload | null = null;

  // TEDTODO - use map instead of array
  syncSpec.files.download.forEach((syncSpecFile: ArSyncSpecDownload) => {
    if (syncSpecFile.name === fileName) {
      file = syncSpecFile;
      return;
    }
  });

  return file;
}
