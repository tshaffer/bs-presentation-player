/** @module Types:base */
import { Action } from 'redux';
import { Dispatch } from 'redux';

import { DmState } from '@brightsign/bsdatamodel';
import { PpHsmState } from './hsm';
import { PresentationDataState } from './presentation';

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface LUT { [key: string]: any; }

export interface BsPpState {
  bsdm: DmState;
  bsPlayer: BsPpModelState;
}

export interface BsPpModelState {
  hsmState: PpHsmState;
  presentationData: PresentationDataState;
}

export interface PpBaseObject {
  id: string;
}

export interface PpMap<T extends PpBaseObject> {
  [id: string]: T;    // really '[id:BsDmId]: T;' -- but Typescript doesn't like that, even though BsDmId = string
}

// TEDTODO - duplicates shapes in ../model/baseAction.ts
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
