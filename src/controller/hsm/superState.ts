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

export const createSuperState = (
  hsmId: string,
  mediaState: DmMediaState,
  superStateId: string,
): BsPpStringThunkAction => {
  return ((dispatch: BsPpDispatch) => {
    const stateId: string = dispatch(createHState(
      createHStateSpecification(
        HStateType.SuperState,
        hsmId,
        superStateId,
        '',
      ),
      {
        mediaStateId: mediaState.id,
      }
    ));
    return stateId;
  });
};

export const STSuperStateEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): BsPpVoidThunkAction => {
  return (dispatch: BsPpDispatch) => {
    if (event.EventType === 'ENTRY_SIGNAL') {
      // console.log('STSuperStateEventHandler: entry signal');
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
