/** @module Model:template */

import { combineReducers } from 'redux';
import {
  HsmState,
  Hsm,
  HsmMap,
  HStateMap,
  HState,
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

export type AddHsmAction = BsPpModelAction<Partial<Hsm>>;
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

export type SetHsmInitializedAction = BsPpModelAction<Partial<Hsm>>;
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

export type SetHsmDataAction = BsPpModelAction<Partial<Hsm>>;
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

export type SetActiveHStateAction = BsPpModelAction<HState | null | any>;
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

export type AddHStateAction = BsPpModelAction<Partial<HState>>;
export function addHState(
  hState: HState,
): AddHStateAction {
  return {
    type: ADD_HSTATE,
    payload: hState,
  };
}

export type SetHStateDataAction = BsPpModelAction<Partial<HState>>;
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
    case SET_HSTATE_DATA: {
      const { id, hStateData } = action.payload as HState;
      const newState = cloneDeep(state) as HStateMap;
      const ppHState = newState[id];
      ppHState.hStateData = hStateData;
      return newState;
    }
    default:
      return state;
  }
};

// TEDTODO - remove??
const initialActiveHStateByHsm: HStateMap = {};
const activeHStateByHsm = (
  state: HStateMap = initialActiveHStateByHsm,
  action: SetActiveHStateAction,
): HStateMap => {
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

export const hsmReducer = combineReducers<HsmState>(
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
