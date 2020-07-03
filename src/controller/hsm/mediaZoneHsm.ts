import { ppCreateZoneHsm } from './zoneHsm';
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
  MediaZoneHsmData,
  PpHState,
  BsPpVoidThunkAction,
} from '../../type';
import { ContentItemType } from '@brightsign/bscore';
import { ppCreateImageState } from './imageState';
import { isNil } from 'lodash';
import { PpHsm } from '../../type';
import { getHsmById, getHStateById, getHStateByMediaStateId } from '../../selector/hsm';
import { setActiveHState, setHsmData } from '../../model';

export const ppCreateMediaZoneHsm = (hsmName: string, hsmType: string, bsdmZone: DmZone): BsPpVoidThunkAction => {
  return ((dispatch: any, getState: any) => {
    const hsmData: MediaZoneHsmData = {
      zoneId: bsdmZone.id,
      x: bsdmZone.position.x,
      y: bsdmZone.position.y,
      height: bsdmZone.position.height,
      width: bsdmZone.position.width,
      initialMediaStateId: bsdmZone.initialMediaStateId,
      mediaStateIdToHState: {},
    };

    const hsmId: string = dispatch(ppCreateZoneHsm(hsmName, hsmType, hsmData));

    const bsdm: DmState = dmFilterDmState(getState());

    const mediaStateIds = dmGetMediaStateIdsForZone(bsdm, { id: bsdmZone.id });
    for (const mediaStateId of mediaStateIds) {
      const bsdmMediaState: DmMediaState = dmGetMediaStateById(bsdm, { id: mediaStateId }) as DmMediaState;
      dispatch(createMediaHState(hsmId, bsdmMediaState, ''));
      const hState: PpHState | null = getHStateByMediaStateId(getState(), bsdmMediaState.id);
      if (!isNil(hState)) {
        hsmData.mediaStateIdToHState[bsdmMediaState.id] = hState;
        dispatch(setHsmData(hsmId, hsmData));
      }
    }
  });
};

const createMediaHState = (hsmId: string, bsdmMediaState: DmMediaState, superStateId: string): BsPpVoidThunkAction => {

  return ((dispatch: any, getState: any) => {

    const hsm: PpHsm = getHsmById(getState(), hsmId);
    if (!isNil(hsm)) {
      const contentItemType = bsdmMediaState.contentItem.type;
      switch (contentItemType) {
        case ContentItemType.Image:
          dispatch(ppCreateImageState(hsmId, bsdmMediaState, hsm.topStateId));
          break;
        case ContentItemType.Video:
          debugger;
          dispatch(ppCreateImageState(hsmId, bsdmMediaState, hsm.topStateId));
          break;
        default:
          break;
      }
    }
  });
};

export const videoOrImagesZoneConstructor = (hsmId: string): BsPpVoidThunkAction => {
  return (dispatch: any, getState: any) => {

    // get the initial media state for the zone
    const bsdm: DmState = dmFilterDmState(getState());
    const hsm: PpHsm = getHsmById(getState(), hsmId);
    let activeState: PpHState | null = null;
    const initialMediaStateId: BsDmId | null =
      dmGetInitialMediaStateIdForZone(bsdm, { id: hsm.hsmData!.zoneId });
    if (!isNil(initialMediaStateId)) {
      const initialMediaState: DmMediaState = dmGetMediaStateById(bsdm, { id: initialMediaStateId }) as DmMediaState;
      activeState = getHStateByMediaStateId(getState(), initialMediaState.id);
    }

    dispatch(setActiveHState(hsmId, activeState));
  };
};

export const videoOrImagesZoneGetInitialState = (hsmId: string): any => {
  return (dispatch: any, getState: any) => {
    console.log('videoOrImagesZoneGetInitialState');
    console.log(getState());
    const hsm: PpHsm = getHsmById(getState(), hsmId);
    console.log(getState());
    const initialState = getHStateById(getState(), hsm.activeStateId);
    return Promise.resolve(initialState);
  };
};
