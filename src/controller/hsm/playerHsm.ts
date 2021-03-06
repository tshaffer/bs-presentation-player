
import {
  createHsm,
  initializeHsm,
} from './hsm';
import { createHState } from './hState';
import {
  getHsmByName,
  getHStateByName,
} from '../../selector/hsm';
import {
  HState,
  HsmType,
  HStateType,
  HsmEventType,
  HSMStateData,
} from '../../type';
import {
  BsPpAnyPromiseThunkAction,
} from '../../model';
import { isNil } from 'lodash';
import { setHsmTop } from '../../model';

import {
  BsPpState,
  PpSchedule,
} from '../../type';
import {
  BsPpDispatch,
  BsPpVoidThunkAction,
  BsPpVoidPromiseThunkAction,
} from '../../model';

import {
  getAutoschedule,
  getSyncSpecFileMap,
  getSrcDirectory,
  getZoneHsmList,
  getSyncSpecReferencedFile,
} from '../../selector';
import {
  BsDmId,
  DmSignState,
  dmOpenSign,
  DmState,
  dmGetZoneById,
  DmZone,
  dmGetZonesForSign,
} from '@brightsign/bsdatamodel';
import { hsmConstructorFunction } from '../hsm/eventHandler';
import { createMediaZoneHsm } from './mediaZoneHsm';
import { getIsHsmInitialized } from '../../selector';
import { addHsmEvent } from '../hsmController';

export const createPlayerHsm = (): any => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    console.log('invoke createPlayerHsm');
    const playerHsmId: string = dispatch(createHsm('player', HsmType.Player, {}));

    const stTopId = dispatch(createHState(
      HStateType.Top,
      playerHsmId,
      '',
      'top'
    ));

    dispatch(setHsmTop(playerHsmId, stTopId));

    const stPlayerId = dispatch(createHState(HStateType.Player, playerHsmId, stTopId, 'player'));

    dispatch(createHState(HStateType.Playing, playerHsmId, stPlayerId, 'playing'));

    dispatch(createHState(HStateType.Waiting, playerHsmId, stPlayerId, 'waiting'));
  });
};

export const initializePlayerHsm = (): any => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    console.log('invoke initializePlayerHsm');
    const playerHsm = getHsmByName(getState(), 'player');
    if (!isNil(playerHsm)) {
      dispatch(initializeHsm(playerHsm.id));
    }
  });
};

export const playerHsmGetInitialState = (): BsPpAnyPromiseThunkAction => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    console.log('invoke playerHsmGetInitialState');
    return dispatch(launchSchedulePlayback(''))
      .then(() => {
        console.log('return from invoking playerHsmGetInitialState restartPlayback');
        const hState = getHStateByName(getState(), 'playing');
        return Promise.resolve(hState);
      });
  });
};

export const STPlayerEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): any => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    stateData.nextStateId = hState.superStateId;

    console.log('***** - STPlayerEventHandler, event type ' + event.EventType);

    return 'SUPER';
  });
};

export const STPlayingEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): any => {

  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    stateData.nextStateId = null;

    console.log('***** - STPlayingEventHandler, event type ' + event.EventType);

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      console.log(hState.id + ': entry signal');

      const action: any = launchPresentationPlayback();
      dispatch(action);

      return 'HANDLED';
    }

    stateData.nextStateId = hState.superStateId;
    return 'SUPER';
  });
};

export const STWaitingEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): any => {

  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    stateData.nextStateId = null;

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      console.log(hState.id + ': entry signal');
      return 'HANDLED';
    } else if (event.EventType && event.EventType === 'TRANSITION_TO_PLAYING') {
      console.log(hState.id + ': TRANSITION_TO_PLAYING event received');
      // const hsmId: string = hState.hsmId;
      // const hsm: PpHsm = getHsmById(getState(), hsmId);
      const stPlayingState: HState | null = getHStateByName(getState(), 'Playing');
      if (!isNil(stPlayingState)) {
        stateData.nextStateId = stPlayingState.id;
        return 'TRANSITION';
      }
      debugger;
    }

    stateData.nextStateId = hState.superStateId;
    return 'SUPER';
  });
};

export const launchSchedulePlayback = (presentationName: string): BsPpVoidPromiseThunkAction => {
  console.log('invoke restartPlayback');

  return (dispatch: BsPpDispatch, getState: () => BsPpState) => {
    const autoSchedule: PpSchedule | null = getAutoschedule(getState());
    if (!isNil(autoSchedule)) {
      //  - only a single scheduled item is currently supported
      const scheduledPresentation = autoSchedule.scheduledPresentations[0];
      const presentationToSchedule = scheduledPresentation.presentationToSchedule;
      presentationName = presentationToSchedule.name;
      const autoplayFileName = presentationName + '.bml';

      const syncSpecFileMap = getSyncSpecFileMap(getState());
      if (!isNil(syncSpecFileMap)) {
        return getSyncSpecReferencedFile(autoplayFileName, syncSpecFileMap, getSrcDirectory(getState()))
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

export const launchPresentationPlayback = (): BsPpVoidThunkAction => {
  console.log('invoke startPlayback');

  return (dispatch: BsPpDispatch, getState: () => BsPpState) => {

    const bsdm: DmState = getState().bsdm;
    console.log('startPlayback');
    console.log(bsdm);

    const zoneIds: BsDmId[] = dmGetZonesForSign(bsdm);
    zoneIds.forEach((zoneId: BsDmId) => {
      const bsdmZone: DmZone = dmGetZoneById(bsdm, { id: zoneId }) as DmZone;
      dispatch(createMediaZoneHsm(zoneId, bsdmZone.type.toString(), bsdmZone));
    });

    const promises: Array<Promise<void>> = [];

    const zoneHsmList = getZoneHsmList(getState());
    for (const zoneHsm of zoneHsmList) {
      dispatch(hsmConstructorFunction(zoneHsm.id));
      const action: BsPpVoidPromiseThunkAction = initializeHsm(zoneHsm.id);
      promises.push(dispatch(action));
    }

    Promise.all(promises).then(() => {
      console.log('startPlayback nearly complete');
      console.log('wait for HSM initialization complete');
      const hsmInitializationComplete = getIsHsmInitialized(getState());
      if (hsmInitializationComplete) {
        const event: HsmEventType = {
          EventType: 'NOP',
        };
        dispatch(addHsmEvent(event));
      }
    });

  };
};
