import { isNil } from 'lodash';
import isomorphicPath from 'isomorphic-path';
import * as fs from 'fs-extra';

import {
  BsPpState,
  ArSyncSpec,
  BsPpDispatch,
  BsPpVoidPromiseThunkAction,
  BsPpVoidThunkAction,
  PpSchedule,
} from '../type';

import {
  updatePresentationPlatform,
  updatePresentationSrcDirectory,
  updatePresentationSyncSpec,
  updatePresentationAutoschedule
} from '../model/presentation';
import {
  getPresentationPlatform,
  getSrcDirectory,
  getSyncSpecFile
} from '../selector';
import { launchHSM } from './playbackEngine';

export const initPresentation = (): BsPpVoidThunkAction => {
  return ((dispatch: BsPpDispatch) => {
    dispatch(loadPresentationData()).then(() => {
      dispatch(launchPlayback());
    });
  });
};

const launchPlayback = (): BsPpVoidThunkAction => {
  return ((dispatch: BsPpDispatch) => {
    dispatch(launchHSM());
  });
};

const loadPresentationData = (): BsPpVoidPromiseThunkAction => {
  return ((dispatch: BsPpDispatch) => {
    dispatch(setPlatform());
    dispatch(setSrcDirectory());
    return dispatch(setSyncSpec())
      .then(() => {
        return dispatch(setAutoschedule());
      });
  });
};

const setPlatform = (): BsPpVoidThunkAction => {
  return ((dispatch: BsPpDispatch) => {
    let platform = '';
    try {
      const gpio = new BSControlPort('BrightSign') as BSControlPort;
      console.log('create controlPort: ');
      console.log(gpio);
      platform = 'BrightSign';
    } catch (e) {
      platform = 'Desktop';
      console.log('failed to create controlPort: ');
    }
    dispatch(updatePresentationPlatform(platform));
  });
};

const setSrcDirectory = (): BsPpVoidThunkAction => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    const platform = getPresentationPlatform(getState());
    let srcDirectory = '';
    if (platform === 'Desktop') {
      srcDirectory = '/Users/tedshaffer/Desktop/autotron-2020';
    } else {
      const process = require('process');
      process.chdir('/storage/sd');
    }
    dispatch(updatePresentationSrcDirectory(srcDirectory));
  });
};

const setSyncSpec = (): BsPpVoidPromiseThunkAction => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    const srcDirectory = getSrcDirectory(getState());
    return getSyncSpec(srcDirectory)
      .then((syncSpec) => {
        dispatch(updatePresentationSyncSpec(syncSpec));
        return Promise.resolve();
      });
  });
};

const setAutoschedule = (): BsPpVoidPromiseThunkAction => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    return new Promise((resolve, reject) => {
      getSyncSpecFile(getState(), 'autoschedule.json')
        .then((autoSchedule: PpSchedule) => {
          dispatch(updatePresentationAutoschedule(autoSchedule));
          return resolve();
        });
    });
  });
};

function getSyncSpec(rootDirectory: string): Promise<ArSyncSpec> {
  return getSyncSpecFilePath(rootDirectory)
    .then((syncSpecFilePath: string | null) => {
      if (!syncSpecFilePath) {
        // TEDTODO - error object
        return Promise.reject('no sync spec found');
      } else {
        return Promise.resolve(readSyncSpec(syncSpecFilePath));
      }
    });
}

function getSyncSpecFilePath(rootDirectory: string): Promise<string | null> {
  return getLocalSyncSpec(rootDirectory)
    .then((localSyncSpecFilePath) => {
      if (isNil(localSyncSpecFilePath)) {
        return getNetworkedSyncSpec(rootDirectory);
      } else {
        return Promise.resolve(localSyncSpecFilePath);
      }
    });
}

function getNetworkedSyncSpec(rootDirectory: string): Promise<string | null> {
  const filePath: string = getNetworkedSyncSpecFilePath(rootDirectory);
  return fs.pathExists(filePath)
    .then((exists: boolean) => {
      if (exists) {
        return Promise.resolve(filePath);
      } else {
        return Promise.resolve(null);
      }
    });
}

function getLocalSyncSpec(rootDirectory: string): Promise<string | null> {
  const filePath: string = getLocalSyncSpecFilePath(rootDirectory);
  return fs.pathExists(filePath)
    .then((exists: boolean) => {
      if (exists) {
        return Promise.resolve(filePath);
      } else {
        return Promise.resolve(null);
      }
    });
}

function getLocalSyncSpecFilePath(rootDirectory: string): string {
  return isomorphicPath.join(rootDirectory, 'local-sync.json');
}

function getNetworkedSyncSpecFilePath(rootDirectory: string): string {
  return isomorphicPath.join(rootDirectory, 'current-sync.json');
}

function readSyncSpec(syncSpecFilePath: string): Promise<ArSyncSpec> {
  return fs.readFile(syncSpecFilePath, 'utf8')
    .then((syncSpecStr: string) => {
      const syncSpec: ArSyncSpec = JSON.parse(syncSpecStr);
      return Promise.resolve(syncSpec);
    });
}
