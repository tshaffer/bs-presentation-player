import {
  BsPpState,
  Hsm,
  HState,
  HStateMap,
  MediaHState,
  ArEventType,
} from '../type';
import { find, isNil, isString } from 'lodash';
import { HsmMap } from '../type';

// ------------------------------------
// Selectors
// ------------------------------------
export function getHsmMap(state: BsPpState): HsmMap {
  return state.bsPlayer.hsmState.hsmById;
}

export function getHsmById(state: BsPpState, hsmId: string): Hsm {
  return state.bsPlayer.hsmState.hsmById[hsmId];
}

export function getHsmByName(
  state: BsPpState,
  hsmName: string
): Hsm | null {
  const hsmMap: HsmMap = getHsmMap(state);
  const hsmId = find(Object.keys(hsmMap), (id) => hsmMap[id].name === hsmName);
  return hsmId ? getHsmById(state, hsmId) : null;
}

export const getActiveStateIdByHsmId = (
  state: BsPpState,
  hsmId: string
): HState | null => {
  const hsm: Hsm = getHsmById(state, hsmId);
  if (!isNil(hsm)) {
    return getHStateById(state, hsm.activeStateId);
  }
  return null;
};

export function getHStateById(state: BsPpState, hStateId: string | null): HState | null {
  if (isNil(hStateId)) {
    return null;
  }
  const hState = state.bsPlayer.hsmState.hStateById[hStateId];
  if (isNil(hState)) {
    debugger;
  }
  return hState;
}

export function getHStateByName(state: BsPpState, name: string | null): HState | null {

  if (isNil(name)) {
    return null;
  }

  const hStateMap: HStateMap = state.bsPlayer.hsmState.hStateById;

  const hStateId = find(Object.keys(hStateMap), (id) => {
    if (hStateMap.hasOwnProperty(id)) {
      const hState = hStateMap[id];
      return (hState.name === name);
    }
    return false;
  });

  return hStateId ? getHStateById(state, hStateId) : null;
}

export function getHStateByMediaStateId(state: BsPpState, mediaStateId: string | null): HState | null {
  if (isNil(mediaStateId)) {
    return null;
  }
  const hStateMap: HStateMap = state.bsPlayer.hsmState.hStateById;

  for (const hStateId in hStateMap) {
    if (hStateMap.hasOwnProperty(hStateId)) {
      const hState = hStateMap[hStateId];
      if (isString((hState as MediaHState).mediaStateId)
        && (hState as MediaHState).mediaStateId === mediaStateId) {
        return hState;
      }
    }
  }

  debugger;
  return null;
}

export function getHsmInitialized(state: BsPpState, hsmId: string): boolean {
  return state.bsPlayer.hsmState.hsmById[hsmId].initialized;
}

export function getZoneHsmList(state: BsPpState): Hsm[] {
  const hsmList: Hsm[] = [];
  const hsmById: HsmMap = state.bsPlayer.hsmState.hsmById;
  for (const hsmId in hsmById) {
    if (hsmById.hasOwnProperty(hsmId)) {
      const hsm: Hsm = hsmById[hsmId];
      if (hsm.type === 'VideoOrImages') {
        hsmList.push(hsm);
      }
    }
  }
  return hsmList;
}

export function getActiveMediaStateId(state: BsPpState, zoneId: string): string {
  const zoneHsmList: Hsm[] = getZoneHsmList(state);
  for (const zoneHsm of zoneHsmList) {
    if (!isNil(zoneHsm.hsmData)) {
      if (zoneHsm.hsmData.zoneId === zoneId) {
        const hState: HState | null = getActiveStateIdByHsmId(state, zoneHsm.id);
        if (isString((hState as MediaHState).mediaStateId)
        ) {
          return (hState as MediaHState).mediaStateId;
        }
      }
    }
  }
  return '';
}

export function getEvents(state: BsPpState): ArEventType[] {
  return state.bsPlayer.hsmState.eventStack;
}
