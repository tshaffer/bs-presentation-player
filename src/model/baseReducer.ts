/** @module Model:base */

import { Reducer } from 'redux';
import { combineReducers } from 'redux';
import { isNil } from 'lodash';
import { BsPpModelState } from '../type';
import {
  BRIGHTSIGN_PLAYER_MODEL_BATCH,
  BsPpModelBaseAction,
  BsPpModelBatchAction,
} from './baseAction';
import {
  hsmReducer,
  isValidHsmState
} from './hsm';
import { presentationDataReducer } from './presentation';

// -----------------------------------------------------------------------
// Defaults
// -----------------------------------------------------------------------

// none

// -----------------------------------------------------------------------
// Reducers
// -----------------------------------------------------------------------

/** @internal */
/** @private */
export type BsBrightSignPlayerReducer = Reducer<BsPpModelState>;

/** @internal */
/** @private */
export const enableBatching = (
  reduce: (state: BsPpModelState,
    action: BsPpModelBaseAction | BsPpModelBatchAction) => BsPpModelState,
): BsBrightSignPlayerReducer => {
  return function batchingReducer(
    state: BsPpModelState,
    action: BsPpModelBaseAction | BsPpModelBatchAction,
  ): BsPpModelState {
    switch (action.type) {
      case BRIGHTSIGN_PLAYER_MODEL_BATCH:
        return (action as BsPpModelBatchAction).payload.reduce(batchingReducer, state);
      default:
        return reduce(state, action);
    }
  };
};

export const bsPpReducer = enableBatching(combineReducers<BsPpModelState>({
  hsmState: hsmReducer,
  presentationData: presentationDataReducer,
}));

// -----------------------------------------------------------------------
// Validators
// -----------------------------------------------------------------------

/** @internal */
/** @private */
export function isValidBsBrightSignPlayerModelState(state: any): boolean {
  return !isNil(state)
    && state.hasOwnProperty('hsm') && isValidHsmState(state.hsmState);
}

/** @internal */
/** @private */
export function isValidBsBrightSignPlayerModelStateShallow(state: any): boolean {
  return !isNil(state)
    && state.hasOwnProperty('hsm');
}