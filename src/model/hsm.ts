/** @module Model:template */

import { combineReducers } from 'redux';
import {
  PpHsmState,
  PpHsm,
  PpHsmMap,
  PpHStateMap,
  PpHState,
  HStateData,
  HsmData,
} from '../type';
import {
  BsPpModelAction,
} from './baseAction';
import {
  cloneDeep,
  isObject,
  isNil,
} from 'lodash';

// ------------------------------------
// Constants
// ------------------------------------

export const ADD_HSM: string = 'ADD_HSM';
export const SET_HSM_TOP: string = 'SET_HSM_TOP';
export const SET_HSM_INITIALIZED: string = 'SET_HSM_INITIALIZED';
export const SET_HSM_DATA: string = 'SET_HSM_DATA';
export const ADD_HSTATE = 'ADD_HSTATE';
export const SET_ACTIVE_HSTATE = 'SET_ACTIVE_HSTATE';
export const SET_HSTATE_DATA = 'SET_HSTATE_DATA';

export type AddHsmAction = BsPpModelAction<Partial<PpHsm>>;
export function addHsm(
  hsm: PpHsm,
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
export type SetHsmTopAction = BsPpModelAction<{}>;
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

export type SetHsmInitializedAction = BsPpModelAction<Partial<PpHsm>>;
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

export type SetHsmDataAction = BsPpModelAction<Partial<PpHsm>>;
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

export type SetActiveHStateAction = BsPpModelAction<PpHState | null | any>;
export function setActiveHState(
  hsmId: string,
  activeState: PpHState | null,
): SetActiveHStateAction {
  return {
    type: SET_ACTIVE_HSTATE,
    payload: {
      id: hsmId,
      activeState,
    }
  };
}

export type AddHStateAction = BsPpModelAction<Partial<PpHState>>;
export function addHState(
  hState: PpHState,
): AddHStateAction {
  return {
    type: ADD_HSTATE,
    payload: hState,
  };
}

export type SetHStateDataAction = BsPpModelAction<Partial<PpHState>>;
export function setHStateData(
  id: string,
  hStateData: HStateData,
): SetHStateDataAction {
  return {
    type: SET_HSTATE_DATA,
    payload: {
      id,
      hStateData,
    }
  };
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialHsmByIdState: PpHsmMap = {};
const hsmById = (
  state: PpHsmMap = initialHsmByIdState,
  action: AddHsmAction | SetHsmTopAction | SetHsmInitializedAction
): PpHsmMap => {
  switch (action.type) {
    case ADD_HSM: {
      const id: string = (action.payload as PpHsm).id;
      return { ...state, [id]: (action.payload as PpHsm) };
    }
    case SET_HSM_TOP: {
      const { hsmId, topStateId } = action.payload as SetHsmTopActionParams;
      const newState = cloneDeep(state) as PpHsmMap;
      const hsm: PpHsm = newState[hsmId];
      hsm.topStateId = topStateId;
      return newState;
    }
    case SET_HSM_INITIALIZED: {
      const id: string = (action as SetHsmInitializedAction).payload.id as string;
      const initialized: boolean = (action as SetHsmInitializedAction).payload.initialized!;
      const newState = cloneDeep(state) as PpHsmMap;
      const hsm: PpHsm = newState[id];
      hsm.initialized = initialized;
      return newState;
    }
    case SET_HSM_DATA: {
      const id: string = (action as SetHsmDataAction).payload.id as string;
      const hsmData: HsmData = (action as SetHsmDataAction).payload.hsmData!;
      const newState = cloneDeep(state) as PpHsmMap;
      const hsm: PpHsm = newState[id];
      hsm.hsmData = hsmData;
      return newState;
    }
    case SET_ACTIVE_HSTATE: {
      const newState = Object.assign({}, state);
      const hsmId: string = (action.payload as any).id;
      const activeState: PpHState = (action.payload as any).activeState;
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

const initialHStateByIdState: PpHStateMap = {};
const hStateById = (
  state: PpHStateMap = initialHStateByIdState,
  action: AddHStateAction,
): PpHStateMap => {
  switch (action.type) {
    case ADD_HSTATE: {
      const id: string = (action.payload as PpHState).id;
      return { ...state, [id]: (action.payload as PpHState) };
    }
    case SET_HSTATE_DATA: {
      const { id, hStateData } = action.payload as PpHState;
      const newState = cloneDeep(state) as PpHStateMap;
      const ppHState = newState[id];
      ppHState.hStateData = hStateData;
      return newState;
    }
    default:
      return state;
  }
};

// TEDTODO - remove??
const initialActiveHStateByHsm: PpHStateMap = {};
const activeHStateByHsm = (
  state: PpHStateMap = initialActiveHStateByHsm,
  action: SetActiveHStateAction,
): PpHStateMap => {
  switch (action.type) {
    // case SET_ACTIVE_HSTATE: {
    //   const newState: PpHStateMap = Object.assign({}, state);
    //   // const hsmId: string = (action.payload as PpHState).hsmId;
    //   const hsmId: string = (action.payload as any).id;
    //   // const activeState: PpHState = action.payload as PpHState;
    //   const activeState: PpHState = (action.payload as any).activeState;
    //   newState[hsmId] = activeState;
    //   return newState;
    // }
    default:
      return state;
  }
};

export const hsmReducer = combineReducers<PpHsmState>(
  { hsmById, hStateById, activeHStateByHsm });

// -----------------------------------------------------------------------
// Validators
// -----------------------------------------------------------------------
/** @internal */
/** @private */
export const isValidHsmState = (state: any): boolean => {
  return isObject(state);
  // TEDTODO
};
