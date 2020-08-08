/** @module Types:base */

import { DmState } from '@brightsign/bsdatamodel';
import { BaContextModelState } from '@brightsign/ba-context-model';
import { HsmState } from './hsm';
import { PresentationDataState } from './presentation';
import { PlaybackState } from './playback';
import { ArDataFeedMap } from './dataFeed';

export class RuntimeEnvironment {
  static BrightSign = 'BrightSign';
  static BaconPreview = 'BaconPreview';
  static Dev = 'Dev';
}
Object.freeze(RuntimeEnvironment);

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface BsPpState {
  bsdm: DmState;
  bacdm: BaContextModelState;
  bsPlayer: BsPpModelState;
}

export interface BsPpModelState {
  hsmState: HsmState;
  presentationData: PresentationDataState;
  playback: PlaybackState;
  arDataFeeds: ArDataFeedMap;
}

export const bsPpStateFromState = (state: any): BsPpState => {
  if (state.hasOwnProperty('bspp')) {
    const bsPpModelState: BsPpModelState = (state as any).bspp;
    const bsPpState: BsPpState = {
      bsdm: state.bsdm,
      bacdm: state.bacdm,
      bsPlayer: {
        playback: bsPpModelState.playback,
        presentationData: bsPpModelState.presentationData,
        hsmState: bsPpModelState.hsmState,
        arDataFeeds: bsPpModelState.arDataFeeds,
      }
    };
    return bsPpState;
  } else if (state.hasOwnProperty('bsPlayer')) {
    return state;
  } else {
    debugger;
    return state;
  }
};

export interface LUT { [key: string]: any; }

export interface BsPpBaseObject {
  id: string;
}

export interface BsPpMap<T extends BsPpBaseObject> {
  [id: string]: T;    // really '[id:BsDmId]: T;' -- but Typescript doesn't like that, even though BsDmId = string
}

export interface FileLUT { [fileName: string]: string; }
