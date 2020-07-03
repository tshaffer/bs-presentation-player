import { DmMediaState } from '@brightsign/bsdatamodel';
import {
  PpHState,
  PpStateType,
  ArEventType,
  HSMStateData,
  BsPpDispatch,
  BsPpVoidThunkAction,
} from '../../type';
import { launchTimer, mediaHStateExitHandler, mediaHStateEventHandler } from '.';
import { ppCreateHState } from './hState';

export const ppCreateImageState = (
  hsmId: string,
  mediaState: DmMediaState,
  superStateId: string,
): BsPpVoidThunkAction => {
  return ((dispatch: BsPpDispatch) => {
    dispatch(ppCreateHState(
      PpStateType.Image,
      hsmId,
      superStateId,
      {
        mediaStateId: mediaState.id,
      },
    ));
  });
};

export const STImageStateEventHandler = (
  hState: PpHState,
  event: ArEventType,
  stateData: HSMStateData
): BsPpVoidThunkAction => {
  return (dispatch: BsPpDispatch) => {
    if (event.EventType === 'ENTRY_SIGNAL') {
      console.log('STImageStateEventHandler: entry signal');
      dispatch(launchTimer(hState));
      return 'HANDLED';
    } else if (event.EventType === 'EXIT_SIGNAL') {
      dispatch(mediaHStateExitHandler(hState.id));
      stateData.nextStateId = hState.superStateId;
      return 'SUPER';
    } else {
      return dispatch(mediaHStateEventHandler(hState, event, stateData));
    }
  };
};
