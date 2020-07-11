import { BsPpMap } from './base';
import {
  HsmType,
} from './hsmTypes';
import { LUT } from './base';
import { HState } from './hState';

export type HsmMap = BsPpMap<Hsm>;
export type HStateMap = BsPpMap<HState>;

export interface HsmState {
  hsmById: HsmMap;
  hStateById: HStateMap;
  hsmEventQueue: HsmEventType[];
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

export interface HsmEventType {
  EventType: string;
  data?: any;
  EventData?: any;
}
