import {
  BsPpAction,
} from './baseAction';
import {
  PresentationDataState,
  //  ScheduledPresentation,
  PpSchedule,
  SyncSpecFileMap,
  RuntimeEnvironment,
} from '../type';
import { isObject } from 'lodash';
import { Dimensions } from '../utility';

export const UPDATE_PRESENTATION_DATA = 'UPDATE_PRESENTATION_DATA';
export const UPDATE_RUNTIME_ENVIRONMENT = 'UPDATE_RUNTIME_ENVIRONMENT';
export const UPDATE_PRESENTATION_SRC_DIRECTORY = 'UPDATE_PRESENTATION_SRC_DIRECTORY';
export const UPDATE_SYNC_SPEC_FILE_MAP = 'UPDATE_SYNC_SPEC_FILE_MAP';
export const UPDATE_AUTOSCHEDULE = 'UPDATE_AUTOSCHEDULE';
export const UPDATE_SCREEN_DIMENSIONS = 'UPDATE_SCREEN_DIMENSIONS';

export type UpdatePresentationDataAction = BsPpAction<Partial<PresentationDataState>>;

export type UpdatePresentationStringAction = BsPpAction<Partial<PresentationDataState>>;

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

export const updateRuntimeEnvironment = (
  runtimeEnvironment: RuntimeEnvironment,
): UpdatePresentationDataAction => {
  return {
    type: UPDATE_RUNTIME_ENVIRONMENT,
    payload: {
      runtimeEnvironment,
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

export const updatePresentationSyncSpecFileMap = (
  syncSpecFileMap: SyncSpecFileMap,
): UpdatePresentationDataAction => {
  return {
    type: UPDATE_SYNC_SPEC_FILE_MAP,
    payload: {
      syncSpecFileMap,
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

export const updateScreenDimensions = (
  screenDimensions: Dimensions,
): UpdatePresentationDataAction => {
  return {
    type: UPDATE_SCREEN_DIMENSIONS,
    payload: {
      screenDimensions,
    }
  };
};

export const presentationDataDefaults: PresentationDataState = {
  runtimeEnvironment: RuntimeEnvironment.Dev,
  srcDirectory: '',
  syncSpecFileMap: null,
  autoSchedule: null,
  screenDimensions: {
    width: 1920,
    height: 1080
  },
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
    case UPDATE_RUNTIME_ENVIRONMENT:
      return {
        ...state,
        runtimeEnvironment: payload.runtimeEnvironment as RuntimeEnvironment,
      };
    case UPDATE_PRESENTATION_SRC_DIRECTORY:
      return {
        ...state,
        srcDirectory: payload.srcDirectory as string,
      };
    case UPDATE_SYNC_SPEC_FILE_MAP:
      return {
        ...state,
        syncSpecFileMap: payload.syncSpecFileMap as SyncSpecFileMap,
      };
    case UPDATE_AUTOSCHEDULE:
      return {
        ...state,
        autoSchedule: payload.autoSchedule as any,
      };
    case UPDATE_SCREEN_DIMENSIONS:
      return {
        ...state,
        screenDimensions: payload.screenDimensions as any,
      };
    default:
      return state;
  }
};

const isValidPresentationDataState = (state: any): boolean => {
  // TEDTODO
  return true;
};
