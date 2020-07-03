import {
  BsPpState,
  BsPpVoidThunkAction,
  BsPpDispatch,
  ArEventType,
  HSMStateData,
  MediaHState,
  Hsm,
  MediaZoneHsmData,
  MediaHStateData,
} from '../../type';
import {
  DmState,
  dmGetEventIdsForMediaState,
  BsDmId,
  dmGetEventStateById,
  DmEvent,
  DmTimer,
  DmMediaState,
  DmcEvent,
  DmcMediaState,
  dmGetMediaStateById,
  dmFilterDmState,
  DmcTransition,
  DmSuperStateContentItem,
} from '@brightsign/bsdatamodel';
import {
  HState,
} from '../../type';
import { EventType, EventIntrinsicAction, ContentItemType } from '@brightsign/bscore';
import {
  setHStateData,
} from '../../model';
import {
  getHStateData, getHsmById,
} from '../../selector';
import { isNil } from 'lodash';
import {
  _bsPpStore,
  queueHsmEvent
} from '../playbackEngine';

export const mediaHStateEventHandler = (
  hState: HState,
  event: ArEventType,
  stateData: HSMStateData
): BsPpVoidThunkAction => {

  return (dispatch: BsPpDispatch, getState: () => BsPpState) => {

    console.log('mediaHStateEventHandler');

    const mediaState: DmMediaState = dmGetMediaStateById(
      dmFilterDmState(getState()),
      { id: (hState.hStateData as MediaHStateData).mediaStateId }) as DmMediaState;
    if (isNil(mediaState)) {
      debugger;
    }

    const matchedEvent: DmcEvent | null = getMatchedEvent(mediaState, event);

    if (!isNil(matchedEvent)) {
      return executeEventMatchAction(getState(), hState, matchedEvent, stateData);
    }

    stateData.nextStateId = hState.superStateId;
    return 'SUPER';
  };
};

const executeEventMatchAction = (
  state: BsPpState,
  hState: HState,
  event: DmcEvent,
  stateData: HSMStateData
): string => {
  if (isNil(event.transitionList) || event.transitionList.length === 0) {
    switch (event.action) {
      case EventIntrinsicAction.None: {
        console.log('remain on current state, playContinuous');
        return 'HANDLED';
      }
      case EventIntrinsicAction.ReturnToPriorState: {
        console.log('return prior state');
        return 'HANDLED';
      }
      default: {
        // AUTOTRONTODO
        debugger;
      }
    }
  } else {
    const transition: DmcTransition = event.transitionList[0]; // AUTOTRONTODO - or event.defaultTransition?
    const targetMediaStateId: BsDmId = transition.targetMediaStateId;
    const hsmId: string = hState.hsmId;
    const zoneHsm: Hsm = getHsmById(state, hsmId);

    const mediaZoneHsmData: MediaZoneHsmData = zoneHsm.hsmData as MediaZoneHsmData;

    let targetHState: MediaHState = mediaZoneHsmData.mediaStateIdToHState[targetMediaStateId];
    if (!isNil(targetHState)) {

      // check to see if target of transition is a superState
      const targetMediaState: DmMediaState | null = dmGetMediaStateById(
        dmFilterDmState(state),
        {
          id: (targetHState.hStateData! as MediaHStateData).mediaStateId,
        }
      );
      if (!isNil(targetMediaState)) {
        if (targetMediaState.contentItem.type === ContentItemType.SuperState) {
          const superStateContentItem = targetMediaState.contentItem as DmSuperStateContentItem;
          const initialMediaStateId = superStateContentItem.initialMediaStateId;
          targetHState = mediaZoneHsmData.mediaStateIdToHState[initialMediaStateId];
        }
      } else {
        debugger;
      }

      stateData.nextStateId! = targetHState.id;
      return 'TRANSITION';
    }
  }
  return '';
};

const eventDataMatches = (matchedEvent: DmcEvent, dispatchedEvent: ArEventType): boolean => {
  return true;
};

const getMatchedEvent = (mediaState: DmMediaState, dispatchedEvent: ArEventType): DmcEvent | null => {
  const mediaStateEvents: DmcEvent[] = (mediaState as DmcMediaState).eventList;
  for (const mediaStateEvent of mediaStateEvents) {
    if (mediaStateEvent.type === dispatchedEvent.EventType) {
      if (eventDataMatches(mediaStateEvent, dispatchedEvent)) {
        return mediaStateEvent;
      }
    }
  }
  return null;
};

export const mediaHStateExitHandler = (
  hStateId: string,
): BsPpVoidThunkAction => {

  return (dispatch: BsPpDispatch, getState: () => BsPpState) => {
    console.log('mediaHStateExitHandler');
    const hStateData: MediaHStateData | null = getHStateData(getState(), hStateId) as MediaHStateData;
    if (!isNil(hStateData) && !isNil(hStateData.timeout)) {
      clearTimeout(hStateData.timeout);
      // TEDTODO - is it okay to dispatching an action inside of a whatever
      dispatch(setHStateData(hStateId,
        {
          // TEDTODO - add the ability to set individual data items
          mediaStateId: hStateData.mediaStateId,
          timeout: null,
        }
      ));
    }
  };
};

interface TimeoutEventCallbackParams {
  hState: HState;
}

export const launchTimer = (
  hState: HState,
): BsPpVoidThunkAction => {

  return (dispatch: BsPpDispatch, getState: () => BsPpState) => {

    // at least part of this will move somwhere else
    const bsdm: DmState = getState().bsdm;

    const eventIds: BsDmId[] = dmGetEventIdsForMediaState(
      bsdm,
      {
        id: (hState.hStateData as MediaHStateData).mediaStateId
      });
    for (const eventId of eventIds) {
      const event: DmEvent = dmGetEventStateById(bsdm, { id: eventId }) as DmEvent;
      if (event.type === EventType.Timer) {
        const interval: number = (event.data as DmTimer).interval;
        if (interval && interval > 0) {
          const timeoutEventCallbackParams: TimeoutEventCallbackParams = {
            hState,
          };
          const timeout = setTimeout(timeoutHandler, interval * 1000, timeoutEventCallbackParams);
          dispatch(setHStateData(hState.id, {
            mediaStateId: (hState.hStateData as MediaHStateData).mediaStateId,
            timeout,
          }));
        }
      }
    }
  };
};

const timeoutHandler = (callbackParams: TimeoutEventCallbackParams): void => {

  const event: ArEventType = {
    EventType: EventType.Timer,
  };

  console.log(event);
  console.log(callbackParams);

  // const { store } = callbackParams;
  // const hsmId = hState.hsmId;
  // const hsm = getHsmById(store.getState(), hsmId);
  // TEDTODO - circular reference?
  _bsPpStore.dispatch(queueHsmEvent(event));
};
