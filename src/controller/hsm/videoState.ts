import { DmMediaState } from '@brightsign/bsdatamodel';
import {
  HState,
  HStateType,
  HsmEventType,
  HSMStateData,
} from '../../type';
import {
  BsPpDispatch,
  BsPpVoidThunkAction,
  BsPpStringThunkAction,
} from '../../model';
import { launchTimer, mediaHStateExitHandler, mediaHStateEventHandler } from '.';
import { createHState, createHStateSpecification } from './hState';

export const createVideoState = (
  hsmId: string,
  mediaState: DmMediaState,
  superStateId: string,
): BsPpStringThunkAction => {
  return ((dispatch: BsPpDispatch) => {
    const videoStateId: string = dispatch(createHState(
      createHStateSpecification(
        HStateType.Video,
        hsmId,
        superStateId,
        '',
      ),
      {
        mediaStateId: mediaState.id,
      },
    ));
    return videoStateId;
  });
};

export const STVideoStateEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): BsPpVoidThunkAction => {
  return (dispatch: BsPpDispatch) => {
    if (event.EventType === 'ENTRY_SIGNAL') {
      // console.log('STVideoStateEventHandler: entry signal');
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
