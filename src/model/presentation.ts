import {
  BsPpModelAction,
} from './baseAction';
import {
  PresentationDataState,
  //  ScheduledPresentation,
  PpSchedule,
} from '../type';
import { isObject } from 'lodash';
import { ArSyncSpec } from '../type';

export const UPDATE_PRESENTATION_DATA = 'UPDATE_PRESENTATION_DATA';
export const UPDATE_PRESENTATION_PLATFORM = 'UPDATE_PRESENTATION_PLATFORM';
export const UPDATE_PRESENTATION_SRC_DIRECTORY = 'UPDATE_PRESENTATION_SRC_DIRECTORY';
export const UPDATE_SYNC_SPEC = 'UPDATE_SYNC_SPEC';
export const UPDATE_AUTOSCHEDULE = 'UPDATE_AUTOSCHEDULE';

export type UpdatePresentationDataAction = BsPpModelAction<Partial<PresentationDataState>>;

export type UpdatePresentationStringAction = BsPpModelAction<Partial<PresentationDataState>>;

export function updatePresentationData(
  presentationDataState: PresentationDataState,
): UpdatePresentationDataAction {
  if (!isObject(presentationDataState) || !isValidPresentationDataState(presentationDataState)) {
    debugger;
  }
  return {
    type: UPDATE_PRESENTATION_DATA,
    payload: presentationDataState
  };
}

export const updatePresentationPlatform = (
  platform: string,
): UpdatePresentationDataAction => {
  return {
    type: UPDATE_PRESENTATION_PLATFORM,
    payload: {
      platform,
    }
  };
};

export const updatePresentationSrcDirectory = (
  srcDirectory: string,
): UpdatePresentationDataAction => {
  return {
    type: UPDATE_PRESENTATION_SRC_DIRECTORY,
    payload: {
      srcDirectory,
    }
  };
};

export const updatePresentationSyncSpec = (
  syncSpec: any,
): UpdatePresentationDataAction => {
  return {
    type: UPDATE_SYNC_SPEC,
    payload: {
      syncSpec,
    }
  };
};

export const updatePresentationAutoschedule = (
  autoSchedule: PpSchedule,
): UpdatePresentationDataAction => {
  return {
    type: UPDATE_AUTOSCHEDULE,
    payload: {
      autoSchedule,
    }
  };
};

export const presentationDataDefaults: PresentationDataState = {
  platform: '',
  srcDirectory: '',
  syncSpec: null,
  autoSchedule: null,
};
Object.freeze(presentationDataDefaults);

export const presentationDataReducer = (
  state: PresentationDataState = presentationDataDefaults,
  { type, payload }: (
    UpdatePresentationDataAction
  ),
): PresentationDataState => {
  switch (type) {
    case UPDATE_PRESENTATION_DATA:
      return Object.assign({}, state, payload);
    case UPDATE_PRESENTATION_PLATFORM:
      return {
        ...state,
        platform: payload.platform as string,
      };
    case UPDATE_PRESENTATION_SRC_DIRECTORY:
      return {
        ...state,
        srcDirectory: payload.srcDirectory as string,
      };
    case UPDATE_SYNC_SPEC:
      return {
        ...state,
        syncSpec: payload.syncSpec as ArSyncSpec,
      };
    case UPDATE_AUTOSCHEDULE:
      return {
        ...state,
        autoSchedule: payload.autoSchedule as any,
      };
    default:
      return state;
  }
};

const isValidPresentationDataState = (state: any): boolean => {
  return true;
};
