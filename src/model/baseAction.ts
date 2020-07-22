/** @module Model:base */

import {
  Action,
  Dispatch,
  ActionCreator,
} from 'redux';
import { BsPpModelState, BsPpState } from '../type';

// -----------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------

/** @internal */
/** @private */
export interface BsPpModelBaseAction extends Action {
  type: string;   // override Any - must be a string
  payload: {} | null;
  error?: boolean;
  meta?: {};
}

/** @internal */
/** @private */
export interface BsPpModelAction<T> extends BsPpModelBaseAction {
  payload: T;     // override payload with specific parameter type
}

/** @internal */
/** @private */
export type BsPpModelActionCreator<T> = ActionCreator<BsPpModelAction<T>>;
export type BsPpModelThunkAction<T> = (
  dispatch: BsPpDispatch,
  getState: () => BsPpModelState,
  extraArgument: undefined,
) => T;

export interface BsPpBaseAction extends Action {
  type: string;
  payload: {} | null;
  error?: boolean;
  meta?: {};
}

export interface BsPpAction<T> extends BsPpBaseAction {
  payload: T;
}

export type BsPpDispatch = Dispatch<BsPpState>;
export type BsPpVoidThunkAction = any;
// (dispatch: BsPpDispatch, getState: () => BaApUiState, extraArgument: undefined) => void;
export type BsPpStringThunkAction = any;
// (dispatch: BsPpDispatch, getState: () => BaApUiState, extraArgument: undefined) => string;
export type BsPpVoidPromiseThunkAction = any;
// (dispatch: BsPpDispatch, getState: () => BaApUiState, extraArgument: undefined) => Promise<void>;
export type BsPpThunkAction<T> = any;
// (dispatch: BsPpDispatch, getState: () => BaApUiState, extraArgument: undefined) => BsPpAction<T>;
export type BsPpAnyPromiseThunkAction = any;
// (dispatch: BsPpDispatch, getState: () => BaApUiState, extraArgument: undefined) => Promise<any>;

export type BsPpActionCreator<T> = ActionCreator<BsPpAction<T>>;

export interface BsPpModelBatchAction extends Action {
  type: string;
  payload: BsPpBaseAction[];
}
