import { createZoneHsm } from './zoneHsm';
import {
  DmZone,
  dmGetMediaStateIdsForZone,
  dmFilterDmState,
  DmState,
  DmMediaState,
  dmGetMediaStateById,
  BsDmId,
  dmGetInitialMediaStateIdForZone,
} from '@brightsign/bsdatamodel';
import {
  MediaZoneHsmProperties,
  HState,
  HsmType,
  LUT,
} from '../../type';
import {
  BsPpVoidThunkAction, BsPpAnyPromiseThunkAction, BsPpStringThunkAction, updateHsmProperties,
} from '../../model';
import { ContentItemType } from '@brightsign/bscore';
import { createImageState } from './imageState';
import { isNil, cloneDeep } from 'lodash';
import { Hsm } from '../../type';
import { getHsmById, getHStateById, getHStateByMediaStateId } from '../../selector/hsm';
import {
  setActiveHState,
  // setHsmData
} from '../../model';

export const createMediaZoneHsm = (hsmName: string, hsmType: HsmType, bsdmZone: DmZone): BsPpVoidThunkAction => {
  return ((dispatch: any, getState: any) => {
    const hsmData: MediaZoneHsmProperties = {
      zoneId: bsdmZone.id,
      x: bsdmZone.position.x,
      y: bsdmZone.position.y,
      height: bsdmZone.position.height,
      width: bsdmZone.position.width,
      initialMediaStateId: bsdmZone.initialMediaStateId,
      mediaStateIdToHState: {},
    };

    const hsmId: string = dispatch(createZoneHsm(hsmName, hsmType, hsmData));

    const bsdm: DmState = dmFilterDmState(getState());

    const mediaStateIds = dmGetMediaStateIdsForZone(bsdm, { id: bsdmZone.id });
    for (const mediaStateId of mediaStateIds) {
      const bsdmMediaState: DmMediaState = dmGetMediaStateById(bsdm, { id: mediaStateId }) as DmMediaState;
      dispatch(createMediaHState(hsmId, bsdmMediaState, ''));
    }
  });
};

const createMediaHState = (
  hsmId: string,
  bsdmMediaState: DmMediaState,
  superStateId: string
): BsPpStringThunkAction => {

  return ((dispatch: any, getState: any) => {

    const hsm: Hsm = getHsmById(getState(), hsmId);
    if (!isNil(hsm)) {
      const contentItemType = bsdmMediaState.contentItem.type;
      switch (contentItemType) {
        case ContentItemType.Image:
          const mediaHStateId: string = dispatch(createImageState(hsmId, bsdmMediaState, hsm.topStateId));
          const hState: HState | null = getHStateById(getState(), mediaHStateId);
          const mediaStateIdToHState: LUT = cloneDeep(hsm.properties as MediaZoneHsmProperties).mediaStateIdToHState;
          mediaStateIdToHState[bsdmMediaState.id] = hState;
          dispatch(updateHsmProperties({ id: hsmId, mediaStateIdToHState }));
          return mediaHStateId;
        case ContentItemType.Video:
          debugger;
          return '';
        default:
          return '';
      }
    }
    return '';
  });
};

export const initializeVideoOrImagesZoneHsm = (hsmId: string): BsPpVoidThunkAction => {
  return (dispatch: any, getState: any) => {

    // get the initial media state for the zone
    const bsdm: DmState = dmFilterDmState(getState());
    const hsm: Hsm = getHsmById(getState(), hsmId);
    if (hsm.type === HsmType.VideoOrImages) {

      const properties: MediaZoneHsmProperties = hsm.properties as MediaZoneHsmProperties;

      let activeState: HState | null = null;
      const initialMediaStateId: BsDmId | null =
        dmGetInitialMediaStateIdForZone(bsdm, { id: properties.zoneId });
      if (!isNil(initialMediaStateId)) {
        const initialMediaState: DmMediaState = dmGetMediaStateById(bsdm, { id: initialMediaStateId }) as DmMediaState;
        activeState = getHStateByMediaStateId(getState(), hsm.id, initialMediaState.id);
      }

      dispatch(setActiveHState(hsmId, activeState));
    }
  };
};

export const videoOrImagesZoneHsmGetInitialState = (hsmId: string): BsPpAnyPromiseThunkAction => {
  return (dispatch: any, getState: any) => {
    console.log('videoOrImagesZoneGetInitialState');
    console.log(getState());
    const hsm: Hsm = getHsmById(getState(), hsmId);
    console.log(getState());
    const initialState = getHStateById(getState(), hsm.activeStateId);
    return Promise.resolve(initialState);
  };
};
