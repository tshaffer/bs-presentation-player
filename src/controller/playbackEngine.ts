import { isNil } from 'lodash';
import * as fs from 'fs-extra';
import isomorphicPath from 'isomorphic-path';
import { Store } from 'redux';

import {
  BsPpState,
  PpSchedule,
  ArSyncSpecDownload,
  ArSyncSpec,
  BsPpVoidPromiseThunkAction,
  BsPpAnyPromiseThunkAction,
  ArEventType,
  HsmMap,
  Hsm,
  HState,
  BsPpDispatch,
  BsPpVoidThunkAction,
} from '../type';
import {
  ppCreatePlayerHsm,
  ppInitializePlayerHsm,
  ppCreateMediaZoneHsm,
  ppInitializeHsm,
  videoOrImagesZoneGetInitialState,
  hsmDispatch,
} from './hsm';
import {
  getAutoschedule,
  getFile,
  getSyncSpec,
  getSrcDirectory,
  getZoneHsmList,
  getHsms,
  // getHsmById,
  getActiveStateIdByHsmId,
  getHsmByName
} from '../selector';
import {
  BsDmId,
  DmSignState,
  dmOpenSign,
  DmState,
  dmGetZoneById,
  DmZone,
  dmGetZonesForSign,
} from '@brightsign/bsdatamodel';
import { hsmConstructorFunction } from './hsm/eventHandler';

export let _bsPpStore: Store<BsPpState>;

const _queuedEvents: ArEventType[] = [];

export function initPlayer(store: Store<BsPpState>) {
  _bsPpStore = store;
  return ((dispatch: BsPpDispatch) => {
    // dispatch(launchHSM());
  });
}

export function launchHSM() {
  return ((dispatch: BsPpDispatch) => {
    dispatch(ppCreatePlayerHsm());
    dispatch(ppInitializePlayerHsm());
  });
}

function getSyncSpecReferencedFile(fileName: string, syncSpec: ArSyncSpec, rootPath: string): Promise<object> {

  const syncSpecFile: ArSyncSpecDownload | null = getFile(syncSpec, fileName);
  if (syncSpecFile == null) {
    return Promise.reject('file not found');
  }

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

export const restartPlayback = (presentationName: string): BsPpVoidPromiseThunkAction => {
  console.log('invoke restartPlayback');

  return (dispatch: BsPpDispatch, getState: () => BsPpState) => {
    const autoSchedule: PpSchedule | null = getAutoschedule(getState());
    if (!isNil(autoSchedule)) {
      //  - only a single scheduled item is currently supported
      const scheduledPresentation = autoSchedule.scheduledPresentations[0];
      const presentationToSchedule = scheduledPresentation.presentationToSchedule;
      presentationName = presentationToSchedule.name;
      const autoplayFileName = presentationName + '.bml';

      const syncSpec = getSyncSpec(getState());
      if (!isNil(syncSpec)) {
        return getSyncSpecReferencedFile(autoplayFileName, syncSpec, getSrcDirectory(getState()))
          .then((bpfxState: any) => {
            const autoPlay: any = bpfxState.bsdm;
            const signState = autoPlay as DmSignState;
            dispatch(dmOpenSign(signState));
          });
      }
      return Promise.resolve();
    } else {
      return Promise.resolve();
    }
  };
};

export const startPlayback = (): BsPpVoidThunkAction => {
  console.log('invoke startPlayback');

  return (dispatch: BsPpDispatch, getState: () => BsPpState) => {

    const bsdm: DmState = getState().bsdm;
    console.log('startPlayback');
    console.log(bsdm);

    const zoneIds: BsDmId[] = dmGetZonesForSign(bsdm);
    zoneIds.forEach((zoneId: BsDmId) => {
      const bsdmZone: DmZone = dmGetZoneById(bsdm, { id: zoneId }) as DmZone;
      dispatch(ppCreateMediaZoneHsm(zoneId, bsdmZone.type.toString(), bsdmZone));
    });

    const promises: Array<Promise<void>> = [];

    const zoneHsmList = getZoneHsmList(getState());
    for (const zoneHsm of zoneHsmList) {
      dispatch(hsmConstructorFunction(zoneHsm.id));
      const action: BsPpVoidPromiseThunkAction = ppInitializeHsm(
        zoneHsm.id,
        getVideoOrImagesInitialState
      );
      promises.push(dispatch(action));
    }

    Promise.all(promises).then(() => {
      console.log('startPlayback nearly complete');
      console.log('wait for HSM initialization complete');
      const hsmInitializationComplete = hsmInitialized(getState());
      if (hsmInitializationComplete) {
        const event: ArEventType = {
          EventType: 'NOP',
        };
        dispatch(queueHsmEvent(event));
      }
    });

  };
};

// TEDTODO - separate queues for each hsm?
export const queueHsmEvent = (event: ArEventType): BsPpVoidThunkAction => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    if (event.EventType !== 'NOP') {
      _queuedEvents.push(event);
    }
    if (hsmInitialized(getState())) {
      while (_queuedEvents.length > 0) {
        dispatch(dispatchHsmEvent(_queuedEvents[0]));
        _queuedEvents.shift();
      }
    }
  });
};

function dispatchHsmEvent(
  event: ArEventType
): BsPpVoidThunkAction {

  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {

    console.log('dispatchHsmEvent:');
    console.log(event.EventType);

    const state: BsPpState = getState();

    const playerHsm: Hsm | null = getHsmByName(state, 'player');
    if (!isNil(playerHsm)) {
      dispatch(hsmDispatch(event, playerHsm.id, playerHsm.activeStateId));
      const hsmMap: HsmMap = getHsms(state);
      for (const hsmId in hsmMap) {
        if (hsmId !== playerHsm.id) {
          const activeState: HState | null = getActiveStateIdByHsmId(state, hsmId);
          if (!isNil(activeState)) {
            dispatch(hsmDispatch(event, hsmId, activeState.id));
          } else {
            debugger;
          }
        }
      }
    }
  });
}

const hsmInitialized = (state: BsPpState): boolean => {

  const hsmMap: HsmMap = getHsms(state);
  for (const hsmId in hsmMap) {
    if (hsmMap.hasOwnProperty(hsmId)) {
      const hsm: Hsm = hsmMap[hsmId];
      if (!hsm.initialized) {
        return false;
      }
    }
  }

  // TEDTODO - need to check if the hsm's associated with zones exist yet
  console.log('number of hsms:');
  console.log(Object.keys(hsmMap).length);

  return true;
};

export const getVideoOrImagesInitialState = (): BsPpAnyPromiseThunkAction => {
  return () => {
    console.log('invoke getVideoOrImagesInitialState');
    return Promise.resolve(videoOrImagesZoneGetInitialState);
  };
};
