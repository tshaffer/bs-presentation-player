/** @module Model:template */

import { combineReducers } from 'redux';

import {
  cloneDeep,
  isObject,
  isNil,
} from 'lodash';

import {
  HsmState,
  Hsm,
  HsmMap,
  HStateMap,
  HState,
  HStateType,
  HStateSpecification,
  HsmEventType,
  LUT,
  MediaHStateData,
  MediaHState,
  MediaHStateParamsData,
} from '../type';
import {
  BsPpAction, BsPpBaseAction,
} from './baseAction';

// ------------------------------------
// Constants
// ------------------------------------

export const ADD_HSM: string = 'ADD_HSM';
export const UPDATE_HSM_PROPERTIES: string = 'UPDATE_HSM_PROPERTIES';
export const SET_HSM_TOP: string = 'SET_HSM_TOP';
export const SET_HSM_INITIALIZED: string = 'SET_HSM_INITIALIZED';
export const ADD_HSTATE = 'ADD_HSTATE';
export const SET_MEDIA_H_STATE_TIMEOUT_ID = 'SET_MEDIA_H_STATE_TIMEOUT_ID';
export const SET_MEDIA_H_STATE_PARAMETER_DATA = 'SET_MEDIA_H_STATE_PARAMETER_DATA';
export const SET_ACTIVE_HSTATE = 'SET_ACTIVE_HSTATE';
export const QUEUE_HSM_EVENT = 'QUEUE_HSM_EVENT';
export const DEQUEUE_HSM_EVENT = 'DEQUEUE_HSM_EVENT';

export type AddHsmAction = BsPpAction<Partial<Hsm>>;
export function addHsm(
  hsm: Hsm,
): AddHsmAction {
  return {
    type: ADD_HSM,
    payload: hsm,
  };
}

export interface HsmParams {
  id: string;
  zoneId?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  initialMediaStateId?: string;
  mediaStateIdToHState?: LUT;
}

export type UpdateHsmPropertiesAction = BsPpAction<HsmParams>;

export function updateHsmProperties(params: HsmParams): UpdateHsmPropertiesAction {
  let payload = params;
  payload = { ...params };
  return {
    type: UPDATE_HSM_PROPERTIES,
    payload,
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
  data?: MediaHStateData | null;
}>;

export function addHState(
  id: string,
  hStateSpecification: HStateSpecification,
  data: MediaHStateData | null = null,
): AddHStateAction {

  const { type, hsmId, superStateId, name } = hStateSpecification;

  return {
    type: ADD_HSTATE,
    payload: {
      id,
      type,
      hsmId,
      superStateId,
      name,
      data: cloneDeep(data),
    },
  };
}

export function setMediaHStateTimeoutId(
  hStateId: string,
  timeoutId: number,
): any {
  return {
    // type: SET_MEDIA_H_STATE_TIMEOUT_ID,
    type: SET_MEDIA_H_STATE_PARAMETER_DATA,
    payload: {
      hStateId,
      timeoutId,
    },
  };
}

export function setMediaHStateParameter(
  hStateId: string,
  parameterName: string,
  parameterValue: any,
): any {
  return {
    type: SET_MEDIA_H_STATE_PARAMETER_DATA,
    payload: {
      hStateId,
      [parameterName]: parameterValue,
    },
  };
}

export type HsmEventAction = BsPpAction<HsmEventType>;

export function queueHsmEvent(
  event: HsmEventType
): HsmEventAction {
  return {
    type: QUEUE_HSM_EVENT,
    payload: event,
  };
}

export function dequeueHsmEvent(
): BsPpBaseAction {
  return {
    type: DEQUEUE_HSM_EVENT,
    payload: null,
  };
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialHsmByIdState: HsmMap = {};
const hsmById = (
  state: HsmMap = initialHsmByIdState,
  action: AddHsmAction | SetHsmTopAction | SetHsmInitializedAction | AddHStateAction | UpdateHsmPropertiesAction
): HsmMap => {
  switch (action.type) {
    case ADD_HSM: {
      const id: string = (action.payload as Hsm).id;
      return { ...state, [id]: (action.payload as Hsm) };
    }
    case UPDATE_HSM_PROPERTIES: {
      const { id, mediaStateIdToHState } = (action as UpdateHsmPropertiesAction).payload;
      const updatedHsm = { ...state[id], properties: { ...state[id].properties, mediaStateIdToHState } };
      return { ...state, [id]: updatedHsm };
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
      const updatedHState = { ...state[hStateId], ...action.payload };
      return { ...state, [hStateId]: updatedHState };
    }
    case SET_MEDIA_H_STATE_PARAMETER_DATA: {
      // console.log('SET_MEDIA_H_STATE_PARAMETER_DATA');
      const hStateId: string = (action.payload as any).hStateId;
      const hState: HState = state[hStateId];
      const mediaHState: MediaHState = hState as MediaHState;
      const newMediaHState: MediaHState = cloneDeep(mediaHState);

      const newMediaHStateData: MediaHStateData = newMediaHState.data;
      if (isNil(newMediaHStateData.mediaStateData)) {
        const keys = Object.keys(action.payload);
        for (const key of keys) {
          if (key !== 'hStateId') {
            const newMediaHStateParamsData: MediaHStateParamsData = {
              [key]: action.payload[key]
            };
            newMediaHStateData.mediaStateData = newMediaHStateParamsData;
            newMediaHState.data = newMediaHStateData;
          }
        }
      } else {
        const newMediaHStateParamsData: MediaHStateParamsData = newMediaHStateData.mediaStateData;
        const keys = Object.keys(action.payload);
        for (const key of keys) {
          if (key !== 'hStateId') {
            newMediaHStateParamsData[key] = action.payload[key];
          }
        }
      }

      const newState = cloneDeep(state);
      newState[hStateId] = newMediaHState;
      return newState;
    }
    default:
      return state;
  }
};

const initialHsmEventQueue: HsmEventType[] = [];
const hsmEventQueue = (
  state: HsmEventType[] = initialHsmEventQueue,
  action: HsmEventAction | BsPpBaseAction,
): HsmEventType[] => {
  switch (action.type) {
    case QUEUE_HSM_EVENT: {
      return [...state, action.payload as HsmEventType];
    }
    case DEQUEUE_HSM_EVENT: {
      return [...state.slice(1)];
    }
    default:
      return state;
  }
};

export const hsmReducer = combineReducers<HsmState>(
  { hsmById, hStateById, hsmEventQueue });

// -----------------------------------------------------------------------
// Validators
// -----------------------------------------------------------------------
/** @internal */
/** @private */
export const isValidHsmState = (state: any): boolean => {
  return isObject(state);
  // TEDTODO
};
