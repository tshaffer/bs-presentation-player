import { Store } from 'redux';

import {
  BsPpState, HsmEventType, Hsm, HState,
} from '../type';
import {
  BsPpDispatch, BsPpVoidThunkAction, queueHsmEvent,
} from '../model';

import {
  createPlayerHsm,
  initializePlayerHsm,
  hsmDispatch,
} from './hsm';

import {
  HsmMap,
} from '../type';
import {
  dequeueHsmEvent,
} from '../model';

import {
  getHsmMap,
  getActiveStateIdByHsmId,
  getHsmByName,
  getIsHsmInitialized,
  getEvents,
} from '../selector';
import { isNil } from 'lodash';

export let _bsPpStore: Store<BsPpState>;

export function initPlayer(store: Store<BsPpState>) {
  _bsPpStore = store;
  return ((dispatch: BsPpDispatch) => {
    // dispatch(launchHSM());
  });
}

export function launchHsm() {
  return ((dispatch: BsPpDispatch) => {
    dispatch(createPlayerHsm());
    dispatch(initializePlayerHsm());
  });
}

export const addHsmEvent = (event: HsmEventType): BsPpVoidThunkAction => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    if (event.EventType !== 'NOP') {
      dispatch(queueHsmEvent(event));
    }
    if (getIsHsmInitialized(getState())) {
      let events: HsmEventType[] = getEvents(getState());

      while (events.length > 0) {
        dispatch(dispatchHsmEvent(events[0]));
        dispatch(dequeueHsmEvent());
        events = getEvents(getState());
      }
    }
  });
};

function dispatchHsmEvent(
  event: HsmEventType
): BsPpVoidThunkAction {

  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {

    console.log('dispatchHsmEvent:');
    console.log(event.EventType);

    const state: BsPpState = getState();

    const playerHsm: Hsm | null = getHsmByName(state, 'player');
    if (!isNil(playerHsm)) {
      dispatch(hsmDispatch(event, playerHsm.id, playerHsm.activeStateId));
      const hsmMap: HsmMap = getHsmMap(state);
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

let _videoElementRef: any;
export function tmpSetVideoElementRef(videoElementRef: any) {
  _videoElementRef = videoElementRef;
}
export function tmpGetVideoElementRef(): any {
  return _videoElementRef;
}
