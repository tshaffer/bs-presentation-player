/** @module Types:base */

import { DmState } from '@brightsign/bsdatamodel';
import { HsmState } from './hsm';
import { PresentationDataState } from './presentation';
import { PlaybackState } from './playback';

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface LUT { [key: string]: any; }

export interface BsPpState {
  bsdm: DmState;
  bsPlayer: BsPpModelState;
}

export interface BsPpModelState {
  hsmState: HsmState;
  presentationData: PresentationDataState;
  playback: PlaybackState;
}

export interface BsPpBaseObject {
  id: string;
}

export interface BsPpMap<T extends BsPpBaseObject> {
  [id: string]: T;    // really '[id:BsDmId]: T;' -- but Typescript doesn't like that, even though BsDmId = string
}

export interface FileLUT { [fileName: string]: string; }
