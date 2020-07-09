import { DmMediaState } from '@brightsign/bsdatamodel';
import {
  HState,
  HStateType,
  ArEventType,
  HSMStateData,
} from '../../type';
import {
  BsPpDispatch,
  BsPpVoidThunkAction,
} from '../../model';
import { launchTimer, mediaHStateExitHandler, mediaHStateEventHandler } from '.';
import { createHState } from './hState';

export const createImageState = (
  hsmId: string,
  mediaState: DmMediaState,
  superStateId: string,
): BsPpVoidThunkAction => {
  return ((dispatch: BsPpDispatch) => {
    dispatch(createHState(
      HStateType.Image,
      hsmId,
      superStateId,
      '',
      {
        mediaStateId: mediaState.id,
      },
    ));
  });
};

export const STImageStateEventHandler = (
  hState: HState,
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
