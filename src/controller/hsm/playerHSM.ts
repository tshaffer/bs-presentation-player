
import {
  ppCreateHsm,
  ppInitializeHsm
} from './hsm';
import { ppCreateHState } from './hState';
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

export const ppCreatePlayerHsm = (): any => {
  return ((dispatch: any, getState: any) => {
    console.log('invoke ppCreatePlayerHsm');
    const playerHsmId: string = dispatch(ppCreateHsm('player', HsmType.Player));

    const stTopId = dispatch(ppCreateHState(
      HStateType.Top,
      playerHsmId,
      '',
      {
        name: 'top',
      }));

    dispatch(setHsmTop(playerHsmId, stTopId));

    const stPlayerId = dispatch(ppCreateHState(HStateType.Player, playerHsmId, stTopId, {
      name: 'player',
    }));

    dispatch(ppCreateHState(HStateType.Playing, playerHsmId, stPlayerId, {
      name: 'playing',
    }));

    dispatch(ppCreateHState(HStateType.Waiting, playerHsmId, stPlayerId, {
      name: 'waiting',
    }));
  });
};

export const ppInitializePlayerHsm = (): any => {
  return ((dispatch: any, getState: any) => {
    console.log('invoke ppInitializePlayerHsm');
    const playerHsm = getHsmByName(getState(), 'player');
    if (!isNil(playerHsm)) {
      dispatch(ppInitializeHsm(
        playerHsm.id,
        initializePlayerStateMachine));
    }
  });
};

export const initializePlayerStateMachine = (): BsPpAnyPromiseThunkAction => {
  return (dispatch: any, getState: any) => {
    console.log('invoke initializePlayerStateMachine');

    // TEDTODO - HOW TO GET restartPlayback here?
    // it should be stored, though not as a function, in redux
    return dispatch(restartPlayback(''))
      .then(() => {
        console.log('return from invoking playerStateMachine restartPlayback');
        return Promise.resolve(getHStateByName(getState(), 'playing'));
        //     return Promise.resolve(this.stPlaying);
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
