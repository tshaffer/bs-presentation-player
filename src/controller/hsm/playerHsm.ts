
import {
  createHsm,
  initializeHsm
} from './hsm';
import { createHState } from './hState';
import {
  restartPlayback,
  startPlayback,
} from '../playbackEngine';
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
        return Promise.resolve(getHStateByName(getState(), 'playing'));
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
