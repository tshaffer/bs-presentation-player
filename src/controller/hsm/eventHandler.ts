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
  return ((dispatch: BsPpDispatch) => {
    if (!isNil(hState)) {
      switch (hState.type) {
        case HStateType.Top:
          return dispatch(STTopEventHandler(hState, event, stateData) as any);
        case HStateType.Player:
          return dispatch(STPlayerEventHandler(hState, event, stateData));
        case HStateType.Playing:
          return dispatch(STPlayingEventHandler(hState, event, stateData));
        case HStateType.Waiting:
          return dispatch(STWaitingEventHandler(hState, event, stateData));
        case HStateType.Image:
          return dispatch(STImageStateEventHandler(hState, event, stateData));
        case HStateType.Video:
          return dispatch(STVideoStateEventHandler(hState, event, stateData));
        case HStateType.SuperState:
          return dispatch(STSuperStateEventHandler(hState, event, stateData));
        default:
          debugger;
          break;
      }
    }

    return null;
  });
};

const STTopEventHandler = (hState: HState, _: HsmEventType, stateData: HSMStateData) => {
  return ((dispatch: BsPpDispatch) => {
    stateData.nextStateId = null;
    return 'IGNORED';
  });
};
