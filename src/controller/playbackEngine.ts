import { isNil } from 'lodash';
import { Store } from 'redux';

import {
  BsPpState,
  ArEventType,
  HsmMap,
  Hsm,
  HState,
} from '../type';
import {
  BsPpDispatch,
  BsPpVoidThunkAction,
  pushEvent,
  popEvent,
} from '../model';

import {
  createPlayerHsm,
  initializePlayerHsm,
  hsmDispatch,
} from './hsm';
import {
  getHsmMap,
  getActiveStateIdByHsmId,
  getHsmByName,
  getEvents
} from '../selector';

export let _bsPpStore: Store<BsPpState>;

// const _queuedEvents: ArEventType[] = [];

export function initPlayer(store: Store<BsPpState>) {
  _bsPpStore = store;
  return ((dispatch: BsPpDispatch) => {
    // dispatch(launchHSM());
  });
}

// wdtb - called from AppController
export function launchHsm() {
  return ((dispatch: BsPpDispatch) => {
    dispatch(createPlayerHsm());
    dispatch(initializePlayerHsm());
  });
}

// TEDTODO - separate queues for each hsm?
// wdtb - mediaHState currently - other hstates
export const queueHsmEvent = (event: ArEventType): BsPpVoidThunkAction => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    if (event.EventType !== 'NOP') {
      dispatch(pushEvent(event));
      // _queuedEvents.push(event);
    }
    if (hsmInitialized(getState())) {
      let events: ArEventType[] = getEvents(getState());

      while (events.length > 0) {
        // dispatch(dispatchHsmEvent(_queuedEvents[0]));
        // _queuedEvents.shift();
        dispatch(dispatchHsmEvent(events[0]));
        dispatch(popEvent());
        events = getEvents(getState());
      }
    }
  });
};

// wdtb - queueHsmEvent
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

// wdtb - ?
export const hsmInitialized = (state: BsPpState): boolean => {

  const hsmMap: HsmMap = getHsmMap(state);
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
