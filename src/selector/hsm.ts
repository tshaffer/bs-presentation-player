import {
  BsPpState,
  PpHsm,
  PpHState,
  HStateData,
  PpHStateMap,
  PlayerHStateData,
  MediaHStateData,
  // PpHsmType,
} from '../type';
import { isNil, isString } from 'lodash';
import { PpHsmMap } from '../type';
// import { DmMediaState, dmGetMediaStateById, dmFilterDmState } from '@brightsign/bsdatamodel';

// ------------------------------------
// Selectors
// ------------------------------------
export function getHsmById(state: BsPpState, hsmId: string): PpHsm {
  return state.bsPlayer.hsmState.hsmById[hsmId];
}

export function getHsmByName(state: BsPpState, hsmName: string): PpHsm | null {
  const hsmMap: PpHsmMap = getHsms(state);
  for (const hsmId in hsmMap) {
    if (hsmMap.hasOwnProperty(hsmId)) {
      const hsm = hsmMap[hsmId];
      if (hsm.name === hsmName) {
        return hsm;
      }
    }
  }
  return null;
}

export function getHsms(state: BsPpState): PpHsmMap {
  return state.bsPlayer.hsmState.hsmById;
}

export const getActiveStateIdByHsmId = (
  state: BsPpState,
  hsmId: string
): PpHState | null => {
  const hsm: PpHsm = getHsmById(state, hsmId);
  if (!isNil(hsm)) {
    return getHStateById(state, hsm.activeStateId);
  }
  return null;
};

export function getHStateById(state: BsPpState, hStateId: string | null): PpHState | null {
  if (isNil(hStateId)) {
    return null;
  }
  const hState = state.bsPlayer.hsmState.hStateById[hStateId];
  if (isNil(hState)) {
    debugger;
  }
  return hState;
}

export function getHStateByName(state: BsPpState, name: string | null): PpHState | null {
  if (isNil(name)) {
    return null;
  }
  const hStateMap: PpHStateMap = state.bsPlayer.hsmState.hStateById;

  for (const hStateId in hStateMap) {
    if (hStateMap.hasOwnProperty(hStateId)) {
      const hState = hStateMap[hStateId];
      if (!isNil(hState.hStateData)
        && isString((hState.hStateData as PlayerHStateData).name)
        && (hState.hStateData as PlayerHStateData).name === name) {
        return hState;
      }
    }
  }

  debugger;
  return null;
}

export function getHStateByMediaStateId(state: BsPpState, mediaStateId: string | null): PpHState | null {
  if (isNil(mediaStateId)) {
    return null;
  }
  const hStateMap: PpHStateMap = state.bsPlayer.hsmState.hStateById;

  for (const hStateId in hStateMap) {
    if (hStateMap.hasOwnProperty(hStateId)) {
      const hState = hStateMap[hStateId];
      if (!isNil(hState.hStateData)
        && isString((hState.hStateData as MediaHStateData).mediaStateId)
        && (hState.hStateData as MediaHStateData).mediaStateId === mediaStateId) {
        return hState;
      }
    }
  }

  debugger;
  return null;
}

export function getHStateData(state: BsPpState, hStateId: string | null): HStateData | null {
  if (isNil(hStateId)) {
    return null;
  }
  const hState: PpHState | null = getHStateById(state, hStateId);
  if (isNil(hState)) {
    return null;
  }
  if (isNil(hState.hStateData)) {
    return null;
  }
  return hState.hStateData;
}

export function getHsmInitialized(state: BsPpState, hsmId: string): boolean {
  return state.bsPlayer.hsmState.hsmById[hsmId].initialized;
}

export function getZoneHsmList(state: BsPpState): PpHsm[] {
  const hsmList: PpHsm[] = [];
  const hsmById: PpHsmMap = state.bsPlayer.hsmState.hsmById;
  for (const hsmId in hsmById) {
    if (hsmById.hasOwnProperty(hsmId)) {
      const hsm: PpHsm = hsmById[hsmId];
      if (hsm.type === 'VideoOrImages') {
        hsmList.push(hsm);
      }
    }
  }
  return hsmList;
}

export function getActiveMediaStateId(state: BsPpState, zoneId: string): string {
  const zoneHsmList: PpHsm[] = getZoneHsmList(state);
  for (const zoneHsm of zoneHsmList) {
    if (!isNil(zoneHsm.hsmData)) {
      if (zoneHsm.hsmData.zoneId === zoneId) {
        const hState: PpHState | null = getActiveStateIdByHsmId(state, zoneHsm.id);
        if (!isNil(hState)
          && !isNil(hState.hStateData)
          && isString((hState.hStateData as MediaHStateData).mediaStateId)
        ) {
          return (hState.hStateData as MediaHStateData).mediaStateId;
        }
      }
    }
  }
  return '';
}
