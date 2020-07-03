/** @module Model:base */

import { Action } from 'redux';
import { Dispatch } from 'redux';
import { ActionCreator } from 'redux';

import { BsPpModelState } from '../type';

// -----------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------

export const BRIGHTSIGN_PLAYER_MODEL_BATCH = 'BRIGHTSIGN_PLAYER_MODEL_BATCH';
export const BRIGHTSIGN_PLAYER_MODEL_REHYDRATE = 'BRIGHTSIGN_PLAYER_MODEL_REHYDRATE';
export const BRIGHTSIGN_PLAYER_MODEL_RESET = 'BRIGHTSIGN_PLAYER_MODEL_RESET';

export type BsPpModelDispatch = Dispatch<any>;

export interface BsPpModelBaseAction extends Action {
  type: string;   // override Any - must be a string
  payload: {};
  error?: boolean;
  meta?: {};
}

export interface BsPpModelAction<T> extends BsPpModelBaseAction {
  payload: T;     // override payload with specific parameter type
}

export type BsPpActionCreator<T> = ActionCreator<BsPpModelAction<T>>;
export type BsPpModelThunkAction<T> = (
  dispatch: BsPpModelDispatch,
  getState: () => BsPpModelState,
  extraArgument: undefined,
) => T;

export const bsPpBatchAction =
  (action: BsPpModelBaseAction[]): BsPpModelBatchAction => {
    return { type: BRIGHTSIGN_PLAYER_MODEL_BATCH, payload: action };
  };

export interface BsPpModelBatchAction extends Action {
  type: string;
  payload: BsPpModelBaseAction[];
}

export interface RehydrateBsPpModelParams {
  newBsBrightSignPlayerModelState: BsPpModelState;
}

export type RehydrateBsPpModelAction =
  BsPpModelAction<RehydrateBsPpModelParams>;
export const bsBrightSignPlayerRehydrateModel =
  (bsBrightSignPlayerState: BsPpModelState): RehydrateBsPpModelAction => {
    return {
      type: BRIGHTSIGN_PLAYER_MODEL_REHYDRATE,
      payload: {
        newBsBrightSignPlayerModelState: bsBrightSignPlayerState,
      },
    };
  };

export type ResetBsPpModelAction = BsPpModelAction<null>;
export const bsBrightSignPlayerResetModel = (): ResetBsPpModelAction => {
  return {
    type: BRIGHTSIGN_PLAYER_MODEL_RESET,
    payload: null,
  };
};
