
import {
  createHsm,
  initializeHsm
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
  ArEventType,
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
  getSyncSpec,
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
import { hsmInitialized, queueHsmEvent } from '../playbackEngine';

export const createPlayerHsm = (): any => {
  return ((dispatch: any, getState: any) => {
    console.log('invoke createPlayerHsm');
    const playerHsmId: string = dispatch(createHsm('player', HsmType.Player));

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
  return ((dispatch: any, getState: any) => {
    console.log('invoke initializePlayerHsm');
    const playerHsm = getHsmByName(getState(), 'player');
    if (!isNil(playerHsm)) {
      dispatch(initializeHsm(playerHsm.id));
    }
  });
};

export const playerStateMachineGetInitialTransition = (): BsPpAnyPromiseThunkAction => {
  return (dispatch: any, getState: any) => {
    console.log('invoke initializePlayerStateMachine');
    return dispatch(restartPlayback(''))
      .then(() => {
        console.log('return from invoking playerStateMachine restartPlayback');
        const hState = getHStateByName(getState(), 'playing');
        return Promise.resolve(hState);
      });
  };
};

export const STPlayerEventHandler = (
  hState: HState,
  event: ArEventType,
  stateData: HSMStateData
): any => {
  return (dispatch: any, getState: any) => {
    stateData.nextStateId = hState.superStateId;

    console.log('***** - STPlayerEventHandler, event type ' + event.EventType);

    return 'SUPER';
  };
};

export const STPlayingEventHandler = (
  hState: HState,
  event: ArEventType,
  stateData: HSMStateData
): any => {

  return (dispatch: any, getState: any) => {
    stateData.nextStateId = null;

    console.log('***** - STPlayingEventHandler, event type ' + event.EventType);

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      console.log(hState.id + ': entry signal');

      const action: any = startPlayback();
      dispatch(action);

      return 'HANDLED';
    }

    stateData.nextStateId = hState.superStateId;
    return 'SUPER';
  };
};

export const STWaitingEventHandler = (
  hState: HState,
  event: ArEventType,
  stateData: HSMStateData
): any => {

  return (dispatch: any, getState: any) => {
    stateData.nextStateId = null;

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      console.log(hState.id + ': entry signal');
      return 'HANDLED';
    } else if (event.EventType && event.EventType === 'TRANSITION_TO_PLAYING') {
      console.log(hState.id + ': TRANSITION_TO_PLAYING event received');
      // const hsmId: string = hState.hsmId;
      // const hsm: PpHsm = getHsmById(getState(), hsmId);
      const stPlayingState: HState | null = getHStateByName(getState, 'Playing');
      if (!isNil(stPlayingState)) {
        stateData.nextStateId = stPlayingState.id;
        return 'TRANSITION';
      }
      debugger;
    }

    stateData.nextStateId = hState.superStateId;
    return 'SUPER';
  };
};

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
