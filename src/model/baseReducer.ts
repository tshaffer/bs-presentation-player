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
import { dataFeedReducer, isValidDataFeedState } from './dataFeed';

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
  arDataFeeds: dataFeedReducer,
}));

// -----------------------------------------------------------------------
// Validators
// -----------------------------------------------------------------------

/** @internal */
/** @private */
// TEDTODO - requires further development
export function isValidBsPpModelState(state: any): boolean {
  return !isNil(state)
  && state.hasOwnProperty('arDataFeeds') && isValidDataFeedState(state.arDataFeeds);

}

/** @internal */
/** @private */
// TEDTODO - requires further development
export function isValidBsPpModelStateShallow(state: any): boolean {
  return !isNil(state);
}