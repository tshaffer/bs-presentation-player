import {
  ArEventType,
  HSMStateData,
  HState,
  HStateType,
  BsPpDispatch,
  HsmType,
} from '../../type';
import { isNil } from 'lodash';
import {
  STPlayerEventHandler,
  STPlayingEventHandler,
  STWaitingEventHandler,
  initializePlayerStateMachine,
} from './playerHSM';
import { videoOrImagesZoneConstructor, videoOrImagesZoneGetInitialState } from './mediaZoneHsm';
import { STImageStateEventHandler } from './imageState';
import { getHsmById } from '../../selector';

export const hsmConstructorFunction = (hsmId: string): any => {
  return (dispatch: BsPpDispatch, getState: any) => {
    const hsm = getHsmById(getState(), hsmId);
    if (!isNil(hsm)) {
      switch (hsm.type) {
        // TEDTODO
        case 'VideoOrImages': {
          return dispatch(videoOrImagesZoneConstructor(hsmId));
        }
        default:
          debugger;
      }
    }
  };
};

export const ppInitialPseudoStateHandler = (hsmId: string) => {
  return (dispatch: BsPpDispatch, getState: any) => {
    const hsm = getHsmById(getState(), hsmId);
    switch (hsm.type) {
      case HsmType.Player:
        return dispatch(initializePlayerStateMachine());
      case 'VideoOrImages':
        // TEDTODO
        return dispatch(videoOrImagesZoneGetInitialState(hsmId));
      default:
        // TEDTODO
        debugger;
    }
  };
};

export const HStateEventHandler = (
  hState: HState,
  event: ArEventType,
  stateData: HSMStateData
): any => {
  return ((dispatch: BsPpDispatch) => {
    if (!isNil(hState)) {
      switch (hState.type) {
        case HStateType.Top:
          return dispatch(STTopEventHandler(hState, event, stateData));
        case HStateType.Player:
          return dispatch(STPlayerEventHandler(hState, event, stateData));
        case HStateType.Playing:
          return dispatch(STPlayingEventHandler(hState, event, stateData));
        case HStateType.Waiting:
          return dispatch(STWaitingEventHandler(hState, event, stateData));
        case HStateType.Image:
          return dispatch(STImageStateEventHandler(hState, event, stateData));
        default:
          debugger;
          break;
      }
    }

    return null;
  });
};

const STTopEventHandler = (hState: HState, _: ArEventType, stateData: HSMStateData) => {
  return ((dispatch: BsPpDispatch) => {
    stateData.nextStateId = null;
    return 'IGNORED';
  });
};
