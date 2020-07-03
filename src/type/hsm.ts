import { BsPpMap } from './base';
import {
  HsmType,
  HStateType
} from './hsmTypes';
import { LUT } from './base';

export type HsmMap = BsPpMap<Hsm>;
export type HStateMap = BsPpMap<HState>;

export interface HsmState {
  hsmById: HsmMap;
  hStateById: HStateMap;
  activeHStateByHsm: HStateMap;
}

export interface Hsm {
  id: string;
  name: string;
  type: HsmType;
  topStateId: string;
  activeStateId: string | null;
  initialized: boolean;
  hsmData?: HsmData;
}

export type HsmData = ZoneHsmData | MediaZoneHsmData;

export interface ZoneHsmData {
  zoneId: string;
  x: number;
  y: number;
  width: number;
  height: number;

  initialMediaStateId: string;
}

export interface MediaZoneHsmData extends ZoneHsmData {
  mediaStateIdToHState: LUT;
}

export interface HState {
  id: string;
  type: HStateType;
  hsmId: string;
  superStateId: string;
  hStateData?: HStateData;
}

export interface MediaHState extends HState {
  mediaStateId: string;
}

export type HStateData = PlayerHStateData | MediaHStateData;

export interface PlayerHStateData {
  name: string;
}

export interface MediaHStateData {
  mediaStateId: string;
  timeout?: any;
}

export interface HSMStateData {
  nextStateId: string | null;
}
