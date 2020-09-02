import {
  BsPpState,
  Hsm,
  HState,
  HStateMap,
  HsmEventType,
  MediaZoneHsmProperties,
  ZoneHsmProperties,
  bsPpStateFromState,
  MediaHState,
  MrssStateData,
} from '../type';
import { find, isNil, isString } from 'lodash';
import { HsmMap } from '../type';
import { dmGetMediaStateById, dmFilterDmState, DmDerivedContentItem } from '@brightsign/bsdatamodel';
import { ContentItemType } from '@brightsign/bscore';

// ------------------------------------
// Selectors
// ------------------------------------
export function getHsmMap(state: any): HsmMap {
  const bsPpState: BsPpState = bsPpStateFromState(state);
  return bsPpState.bsPlayer.hsmState.hsmById;
}

export function getHsmById(state: any, hsmId: string): Hsm {
  const bsPpState: BsPpState = bsPpStateFromState(state);
  return bsPpState.bsPlayer.hsmState.hsmById[hsmId];
}

export function getHsmByName(
  state: BsPpState,
  hsmName: string
): Hsm | null {
  const bsPpState: BsPpState = bsPpStateFromState(state);
  const hsmMap: HsmMap = getHsmMap(bsPpState);
  const hsmId = find(Object.keys(hsmMap), (id) => hsmMap[id].name === hsmName);
  return hsmId ? getHsmById(bsPpState, hsmId) : null;
}

export const getActiveHStateIdByHsmId = (
  state: BsPpState,
  hsmId: string
): HState | null => {
  const bsPpState: BsPpState = bsPpStateFromState(state);
  const hsm: Hsm = getHsmById(bsPpState, hsmId);
  if (!isNil(hsm)) {
    return getHStateById(bsPpState, hsm.activeStateId);
  }
  return null;
};

export function getHStateById(state: any, hStateId: string | null): HState | null {
  const bsPpState: BsPpState = bsPpStateFromState(state);
  if (isNil(hStateId)) {
    return null;
  }
  const hState = bsPpState.bsPlayer.hsmState.hStateById[hStateId as string];
  if (isNil(hState)) {
    debugger;
  }
  return hState;
}

export function getHStateByName(state: any, name: string | null): HState | null {
  const bsPpState: BsPpState = bsPpStateFromState(state);

  if (isNil(name)) {
    return null;
  }

  const hStateMap: HStateMap = bsPpState.bsPlayer.hsmState.hStateById;

  const hStateId = find(Object.keys(hStateMap), (id) => {
    if (hStateMap.hasOwnProperty(id)) {
      const hState = hStateMap[id];
      return (hState.name === name);
    }
    return false;
  });

  return hStateId ? getHStateById(bsPpState, hStateId) : null;
}

export function getHStateByMediaStateId(state: any, hsmId: string, mediaStateId: string | null): HState | null {
  const bsPpState: BsPpState = bsPpStateFromState(state);

  if (isNil(mediaStateId)) {
    return null;
  }

  const hsm: Hsm = getHsmById(bsPpState, hsmId);

  // TEDTODO - near term hack...
  const staleHState = (hsm.properties as MediaZoneHsmProperties).mediaStateIdToHState[mediaStateId as string];
  const hStateId = staleHState.id;
  const hState = getHStateById(state, hStateId);
  return hState;
  // the following may return a stale hState. why? after properties are set on hState?
  // return (hsm.properties as MediaZoneHsmProperties).mediaStateIdToHState[mediaStateId as string];
}

export function getHsmInitialized(state: any, hsmId: string): boolean {
  const bsPpState: BsPpState = bsPpStateFromState(state);

  return bsPpState.bsPlayer.hsmState.hsmById[hsmId].initialized;
}

export function getZoneHsmList(state: any): Hsm[] {
  const bsPpState: BsPpState = bsPpStateFromState(state);

  const hsmList: Hsm[] = [];
  const hsmById: HsmMap = bsPpState.bsPlayer.hsmState.hsmById;
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

export function getZoneHsmFromZoneId(state: any, zoneId: string): Hsm | null {
  const bsPpState: BsPpState = bsPpStateFromState(state);
  const zoneHsmList: Hsm[] = getZoneHsmList(bsPpState);
  for (const zoneHsm of zoneHsmList) {
    if (!isNil(zoneHsm.properties)) {
      if (isString((zoneHsm.properties as ZoneHsmProperties).zoneId)) {
        if ((zoneHsm.properties as ZoneHsmProperties).zoneId === zoneId) {
          return zoneHsm;
        }
      }
    }
  }
  return null;
}

export function getActiveMediaStateId(state: any, zoneId: string): string {
  const bsPpState: BsPpState = bsPpStateFromState(state);
  const zoneHsm: Hsm | null = getZoneHsmFromZoneId(state, zoneId);
  if (!isNil(zoneHsm)) {
    const activeHStateId: string = zoneHsm.activeStateId as string;
    const activeHState = getHStateById(bsPpState, activeHStateId);
    if (!isNil(activeHState)) {
      return (activeHState as MediaHState).data.mediaStateId;
    }
    return zoneHsm.activeStateId as string;
  }
  return '';
}

export function getActiveMrssDisplayIndex(state: any, zoneId: string): number {
  // TEDTODO - the following is called here and in getActiveMediaStateId - fix this
  const zoneHsm: Hsm | null = getZoneHsmFromZoneId(state, zoneId);
  if (!isNil(zoneHsm)) {
    const mediaStateId = getActiveMediaStateId(state, zoneId);
    const mediaState = dmGetMediaStateById(dmFilterDmState(state), { id: mediaStateId });
    if (!isNil(mediaState)) {
      const contentItem: DmDerivedContentItem = mediaState.contentItem;
      if (contentItem.type === ContentItemType.MrssFeed) {
        const mrssState = getHStateByMediaStateId(state, zoneHsm.id, mediaStateId) as MediaHState;
        if (!isNil(mrssState)) {
          const mrssStateData: MrssStateData = mrssState.data.mediaStateData! as MrssStateData;
          const displayIndex: number = mrssStateData.displayIndex;
          return displayIndex;
        }
      }
    }
  }

  return -1;
}

export function getEvents(state: any): HsmEventType[] {
  const bsPpState: BsPpState = bsPpStateFromState(state);
  return bsPpState.bsPlayer.hsmState.hsmEventQueue;
}

export const getIsHsmInitialized = (state: any): boolean => {
  const bsPpState: BsPpState = bsPpStateFromState(state);
  const hsmMap: HsmMap = getHsmMap(bsPpState);
  for (const hsmId in hsmMap) {
    if (hsmMap.hasOwnProperty(hsmId)) {
      const hsm: Hsm = hsmMap[hsmId];
      if (!hsm.initialized) {
        return false;
      }
    }
  }

  // TEDTODO - need to check if the hsm's associated with zones exist yet
  // console.log('number of hsms:');
  // console.log(Object.keys(hsmMap).length);

  return true;
};
