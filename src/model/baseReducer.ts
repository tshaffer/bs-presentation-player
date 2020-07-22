/** @module Model:base */

import {
  Reducer,
  combineReducers
} from 'redux';
import { isNil } from 'lodash';
import { BsPpModelState } from '../type';
import {
  BsPpModelBaseAction,
} from './baseAction';
import { hsmReducer } from './hsm';
import { presentationDataReducer } from './presentation';
import { playbackReducer } from './playback';

// -----------------------------------------------------------------------
// Defaults
// -----------------------------------------------------------------------

// none

// -----------------------------------------------------------------------
// Reducers
// -----------------------------------------------------------------------

/** @internal */
/** @private */
export type BsUiReducer = Reducer<BsPpModelState>;

/** @internal */
/** @private */
export const enableBatching = (
  reduce: (state: BsPpModelState, action: BsPpModelBaseAction ) => BsPpModelState,
): BsUiReducer => {
  return function batchingReducer(
    state: BsPpModelState,
    action: BsPpModelBaseAction,
  ): BsPpModelState {
    switch (action.type) {
      default:
        return reduce(state, action);
    }
  };
};

export const bsPpReducer = enableBatching(combineReducers<BsPpModelState>({
  hsmState: hsmReducer,
  presentationData: presentationDataReducer,
  playback: playbackReducer,
}));

// -----------------------------------------------------------------------
// Validators
// -----------------------------------------------------------------------

/** @internal */
/** @private */
export function isValidBsPpModelState(state: any): boolean {
  return !isNil(state);
}

/** @internal */
/** @private */
export function isValidBsPpModelStateShallow(state: any): boolean {
  return !isNil(state);
}