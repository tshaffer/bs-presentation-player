import { PpMap } from './base';
import {
  PpHsmType,
  PpStateType
} from './hsmTypes';
import { LUT } from './base';

export type PpHsmMap = PpMap<PpHsm>;
export type PpHStateMap = PpMap<PpHState>;

export interface PpHsmState {
  hsmById: PpHsmMap;
  hStateById: PpHStateMap;
  activeHStateByHsm: PpHStateMap;
}

export interface PpHsm {
  id: string;
  name: string;
  type: PpHsmType;
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

export interface PpHState {
  id: string;
  type: PpStateType;
  hsmId: string;
  superStateId: string;
  hStateData?: HStateData;
}

export interface MediaHState extends PpHState {
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
