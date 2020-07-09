/** @module Model:template */

import { combineReducers } from 'redux';
import {
  HsmState,
  Hsm,
  HsmMap,
  HStateMap,
  HState,
  HsmData,
  HStateType,
  HStateSpecification,
} from '../type';
import {
  BsPpAction,
} from './baseAction';
import {
  cloneDeep,
  isObject,
  isNil,
} from 'lodash';
import { MediaHState } from '../type';

// ------------------------------------
// Constants
// ------------------------------------

export const ADD_HSM: string = 'ADD_HSM';
export const SET_HSM_TOP: string = 'SET_HSM_TOP';
export const SET_HSM_INITIALIZED: string = 'SET_HSM_INITIALIZED';
export const SET_HSM_DATA: string = 'SET_HSM_DATA';
export const ADD_HSTATE = 'ADD_HSTATE';
export const SET_MEDIA_H_STATE_TIMEOUT_ID = 'SET_MEDIA_H_STATE_TIMEOUT_ID';
export const SET_ACTIVE_HSTATE = 'SET_ACTIVE_HSTATE';

export type AddHsmAction = BsPpAction<Partial<Hsm>>;
export function addHsm(
  hsm: Hsm,
): AddHsmAction {
  return {
    type: ADD_HSM,
    payload: hsm,
  };
}

interface SetHsmTopActionParams {
  hsmId: string;
  topStateId: string;
}
export type SetHsmTopAction = BsPpAction<{}>;
export function setHsmTop(
  hsmId: string,
  topStateId: string,
): SetHsmTopAction {
  return {
    type: SET_HSM_TOP,
    payload: {
      hsmId,
      topStateId,
    }
  };
}

export type SetHsmInitializedAction = BsPpAction<Partial<Hsm>>;
export function setHsmInitialized(
  id: string,
  initialized: boolean,
): SetHsmInitializedAction {
  return {
    type: SET_HSM_INITIALIZED,
    payload: {
      id,
      initialized,
    }
  };
}

export type SetHsmDataAction = BsPpAction<Partial<Hsm>>;
export function setHsmData(
  id: string,
  hsmData: HsmData): SetHsmDataAction {
  return {
    type: SET_HSM_DATA,
    payload: {
      id,
      hsmData,
    }
  };
}

export type SetActiveHStateAction = BsPpAction<HState | null | any>;
export function setActiveHState(
  hsmId: string,
  activeState: HState | null,
): SetActiveHStateAction {
  return {
    type: SET_ACTIVE_HSTATE,
    payload: {
      id: hsmId,
      activeState,
    }
  };
}

export type AddHStateAction = BsPpAction<{
  id: string;
  type: HStateType;
  hsmId: string;
  superStateId: string;
  name: string;
  mediaStateId?: string;
  timeoutId?: number;
}>;

export interface AddHStateOptions {
  mediaStateId: string;
  timeoutId?: number;
}

export function addHState(
  hStateSpecification: HStateSpecification,
  options?: AddHStateOptions,
): AddHStateAction {

  let mediaStateId;
  let timeoutId;

  if (!isNil(options)) {
    mediaStateId = options.mediaStateId;
    timeoutId = options.timeoutId;
  }

  const { id, type, hsmId, superStateId, name } = hStateSpecification;

  return {
    type: ADD_HSTATE,
    payload: {
      id,
      type,
      hsmId,
      superStateId,
      name,
      mediaStateId,
      timeoutId,
    },
  };
}

export function setMediaHStateTimeoutId(
  hStateId: string,
  timeoutId: number,
): any {
  return {
    type: SET_MEDIA_H_STATE_TIMEOUT_ID,
    payload: {
      hStateId,
      timeoutId,
    },
  };
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialHsmByIdState: HsmMap = {};
const hsmById = (
  state: HsmMap = initialHsmByIdState,
  action: AddHsmAction | SetHsmTopAction | SetHsmInitializedAction
): HsmMap => {
  switch (action.type) {
    case ADD_HSM: {
      const id: string = (action.payload as Hsm).id;
      return { ...state, [id]: (action.payload as Hsm) };
    }
    case SET_HSM_TOP: {
      const { hsmId, topStateId } = action.payload as SetHsmTopActionParams;
      const newState = cloneDeep(state) as HsmMap;
      const hsm: Hsm = newState[hsmId];
      hsm.topStateId = topStateId;
      return newState;
    }
    case SET_HSM_INITIALIZED: {
      const id: string = (action as SetHsmInitializedAction).payload.id as string;
      const initialized: boolean = (action as SetHsmInitializedAction).payload.initialized!;
      const newState = cloneDeep(state) as HsmMap;
      const hsm: Hsm = newState[id];
      hsm.initialized = initialized;
      return newState;
    }
    case SET_HSM_DATA: {
      const id: string = (action as SetHsmDataAction).payload.id as string;
      const hsmData: HsmData = (action as SetHsmDataAction).payload.hsmData!;
      const newState = cloneDeep(state) as HsmMap;
      const hsm: Hsm = newState[id];
      hsm.hsmData = hsmData;
      return newState;
    }
    case SET_ACTIVE_HSTATE: {
      const newState = Object.assign({}, state);
      const hsmId: string = (action.payload as any).id;
      const activeState: HState = (action.payload as any).activeState;
      if (isNil(activeState)) {
        newState[hsmId].activeStateId = null;
      } else {
        newState[hsmId].activeStateId = activeState.id;
      }
      return newState;
    }
    default:
      return state;
  }
};

const initialHStateByIdState: HStateMap = {};
const hStateById = (
  state: HStateMap = initialHStateByIdState,
  action: AddHStateAction,
): HStateMap => {
  switch (action.type) {
    case ADD_HSTATE: {
      const id: string = (action.payload as HState).id;
      return { ...state, [id]: (action.payload as HState) };
    }
    case SET_MEDIA_H_STATE_TIMEOUT_ID: {
      const hStateId: string = (action.payload as any).hStateId;
      const newState = cloneDeep(state) as HStateMap;
      const hState: MediaHState = newState[hStateId] as unknown as MediaHState;
      hState.timeoutId = action.payload.timeoutId;
      return newState;
    }
    default:
      return state;
  }
};

export const hsmReducer = combineReducers<HsmState>(
  { hsmById, hStateById });

// -----------------------------------------------------------------------
// Validators
// -----------------------------------------------------------------------
/** @internal */
/** @private */
export const isValidHsmState = (state: any): boolean => {
  return isObject(state);
  // TEDTODO
};
