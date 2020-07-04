/** @module Model:base */

import { Action } from 'redux';
import { Dispatch } from 'redux';
import { ActionCreator } from 'redux';

import { BsPpModelState, BsPpState } from '../type';

// -----------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------

export const BRIGHTSIGN_PLAYER_MODEL_BATCH = 'BRIGHTSIGN_PLAYER_MODEL_BATCH';
export const BRIGHTSIGN_PLAYER_MODEL_REHYDRATE = 'BRIGHTSIGN_PLAYER_MODEL_REHYDRATE';
export const BRIGHTSIGN_PLAYER_MODEL_RESET = 'BRIGHTSIGN_PLAYER_MODEL_RESET';

export type BsPpModelDispatch = Dispatch<any>;

// export interface BsPpBaseAction extends Action {
//   type: string;   // override Any - must be a string
//   payload: {};
//   error?: boolean;
//   meta?: {};
// }

// export interface BsPpAction<T> extends BsPpBaseAction {
//   payload: T;     // override payload with specific parameter type
// }

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
export type BsPpVoidThunkAction =
  (dispatch: BsPpDispatch, getState: () => BsPpState, extraArgument: undefined) => void;
export type BsPpStringThunkAction =
  (dispatch: BsPpDispatch, getState: () => BsPpState, extraArgument: undefined) => string;
export type BsPpVoidPromiseThunkAction =
  (dispatch: BsPpDispatch, getState: () => BsPpState, extraArgument: undefined) => Promise<void>;
export type BsPpThunkAction<T> =
  (dispatch: BsPpDispatch, getState: () => BsPpState, extraArgument: undefined) => BsPpAction<T>;
export type BsPpAnyPromiseThunkAction =
  (dispatch: BsPpDispatch, getState: () => BsPpState, extraArgument: undefined) => Promise<any>;

export type BsPpActionCreator<T> = ActionCreator<BsPpAction<T>>;
export type BsPpModelThunkAction<T> = (
  dispatch: BsPpModelDispatch,
  getState: () => BsPpModelState,
  extraArgument: undefined,
) => T;

export const bsPpBatchAction =
  (action: BsPpBaseAction[]): BsPpModelBatchAction => {
    return { type: BRIGHTSIGN_PLAYER_MODEL_BATCH, payload: action };
  };

export interface BsPpModelBatchAction extends Action {
  type: string;
  payload: BsPpBaseAction[];
}

export interface RehydrateBsPpModelParams {
  newBsBrightSignPlayerModelState: BsPpModelState;
}

export type RehydrateBsPpAction =
  BsPpAction<RehydrateBsPpModelParams>;
export const bsBrightSignPlayerRehydrateModel =
  (bsBrightSignPlayerState: BsPpModelState): RehydrateBsPpAction => {
    return {
      type: BRIGHTSIGN_PLAYER_MODEL_REHYDRATE,
      payload: {
        newBsBrightSignPlayerModelState: bsBrightSignPlayerState,
      },
    };
  };

export type ResetBsPpAction = BsPpAction<null>;
export const bsBrightSignPlayerResetModel = (): ResetBsPpAction => {
  return {
    type: BRIGHTSIGN_PLAYER_MODEL_RESET,
    payload: null,
  };
};
