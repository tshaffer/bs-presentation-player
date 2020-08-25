import {
  BsPpState,
  HsmEventType,
  HSMStateData,
  HState,
  HStateType,
  HsmType,
  bsPpStateFromState,
} from '../../type';
import { isNil } from 'lodash';
import {
  STPlayerEventHandler,
  STPlayingEventHandler,
  STWaitingEventHandler,
  playerHsmGetInitialState,
} from './playerHsm';
import { initializeVideoOrImagesZoneHsm, videoOrImagesZoneHsmGetInitialState } from './mediaZoneHsm';
import { STImageStateEventHandler } from './imageState';
import { getHsmById } from '../../selector';
import {
  BsPpDispatch, BsPpVoidThunkAction,
} from '../../model';
import { STVideoStateEventHandler } from './videoState';
import { STSuperStateEventHandler } from './superState';
import { STMrssStateEventHandler } from './mrssState';
import { BsPpModelState } from '../../..';

export const hsmConstructorFunction = (hsmId: string): BsPpVoidThunkAction => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    const hsm = getHsmById(bsPpStateFromState(getState()), hsmId);
    if (!isNil(hsm)) {
      switch (hsm.type) {
        case HsmType.Player:
          break;
        case HsmType.VideoOrImages: {
          return dispatch(initializeVideoOrImagesZoneHsm(hsmId));
        }
        default:
          debugger;
      }
    }
  });
};

export const hsmInitialPseudoStateHandler = (hsmId: string) => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    const hsm = getHsmById(bsPpStateFromState(getState()), hsmId);
    switch (hsm.type) {
      case HsmType.Player:
        const playerHsmAction = playerHsmGetInitialState();
        return dispatch(playerHsmAction);
      case HsmType.VideoOrImages:
        const videoOrImagesZoneHsmAction = videoOrImagesZoneHsmGetInitialState(hsmId);
        return dispatch(videoOrImagesZoneHsmAction);
      default:
        // TEDTODO
        debugger;
    }
    return;
  });
};

export const HStateEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): any => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {

    const bsPlayerStateBefore: BsPpModelState = getState().bsPlayer;
    console.log('** HStateEventHandler');
    console.log(hState.type);
    console.log(event.EventType);
    console.log(event.EventData);
    console.log('bsPlayerState before:');
    console.log(bsPlayerStateBefore);

    let retVal: any = null;

    if (!isNil(hState)) {
      switch (hState.type) {
        case HStateType.Top:
          retVal = dispatch(STTopEventHandler(hState, event, stateData) as any);
          break;
        case HStateType.Player:
          retVal = dispatch(STPlayerEventHandler(hState, event, stateData));
          break;
        case HStateType.Playing:
          retVal = dispatch(STPlayingEventHandler(hState, event, stateData));
          break;
        case HStateType.Waiting:
          retVal = dispatch(STWaitingEventHandler(hState, event, stateData));
          break;
        case HStateType.Image:
          retVal = dispatch(STImageStateEventHandler(hState, event, stateData));
          break;
        case HStateType.Video:
          retVal = dispatch(STVideoStateEventHandler(hState, event, stateData));
          break;
        case HStateType.SuperState:
          retVal = dispatch(STSuperStateEventHandler(hState, event, stateData));
          break;
        case HStateType.Mrss:
          retVal = dispatch(STMrssStateEventHandler(hState, event, stateData));
          break;
        default:
          debugger;
          break;
      }
    }

    const bsPlayerStateAfter: BsPpModelState = getState().bsPlayer;
    console.log('bsPlayerState after:');
    console.log(bsPlayerStateAfter);

    return retVal;
  });
};

const STTopEventHandler = (hState: HState, _: HsmEventType, stateData: HSMStateData) => {
  return ((dispatch: BsPpDispatch) => {
    stateData.nextStateId = null;
    return 'IGNORED';
  });
};
