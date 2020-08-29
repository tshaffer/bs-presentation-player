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
  dmGetContainedMediaStateIdsForMediaState,
  DmDataFeedContentItem,
  DmcDataFeed,
  dmGetDataFeedById,
} from '@brightsign/bsdatamodel';
import {
  MediaZoneHsmProperties,
  HState,
  HsmType,
  LUT,
  BsPpState,
  bsPpStateFromState,
} from '../../type';
import {
  BsPpVoidThunkAction, BsPpAnyPromiseThunkAction, BsPpStringThunkAction, updateHsmProperties, BsPpDispatch,
} from '../../model';
import { ContentItemType } from '@brightsign/bscore';
import { createImageState } from './imageState';
import { createVideoState } from './videoState';
import { createSuperState } from './superState';
import { isNil, cloneDeep } from 'lodash';
import { Hsm } from '../../type';
// import { getHsmById, getHStateById, getHStateByMediaStateId } from '../../selector/hsm';
import {
  setActiveHState,
  // setHsmData
} from '../../model';
import { getHsmById, getHStateById, getHStateByMediaStateId } from '../../selector';
import { createMrssState } from './mrssState';

export const createMediaZoneHsm = (hsmName: string, hsmType: HsmType, bsdmZone: DmZone): BsPpVoidThunkAction => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
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
    const hsm: Hsm = getHsmById(bsPpStateFromState(getState()), hsmId);

    const bsdm: DmState = dmFilterDmState(bsPpStateFromState(getState()));

    const mediaStateIds = dmGetMediaStateIdsForZone(bsdm, { id: bsdmZone.id });
    for (const mediaStateId of mediaStateIds) {
      const bsdmMediaState: DmMediaState = dmGetMediaStateById(bsdm, { id: mediaStateId }) as DmMediaState;
      dispatch(createMediaHState(hsmId, bsdmMediaState, hsm.topStateId));
    }
  });
};

const createMediaHState = (
  hsmId: string,
  bsdmMediaState: DmMediaState,
  superStateId: string
): BsPpStringThunkAction => {

  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    const hsm: Hsm = getHsmById(bsPpStateFromState(getState()), hsmId);
    if (!isNil(hsm)) {
      const contentItemType = bsdmMediaState.contentItem.type;
      switch (contentItemType) {
        case ContentItemType.Image:
          const imageHStateId: string = dispatch(createImageState(hsmId, bsdmMediaState, superStateId));
          const imageHState: HState | null = getHStateById(bsPpStateFromState(getState()), imageHStateId);
          const imageStateIdToHState: LUT = cloneDeep(hsm.properties as MediaZoneHsmProperties).mediaStateIdToHState;
          imageStateIdToHState[bsdmMediaState.id] = imageHState;
          dispatch(updateHsmProperties({ id: hsmId, mediaStateIdToHState: imageStateIdToHState }));
          return imageHStateId;
        case ContentItemType.Video:
          const videoHStateId: string = dispatch(createVideoState(hsmId, bsdmMediaState, superStateId));
          const videoHState: HState | null = getHStateById(bsPpStateFromState(getState()), videoHStateId);
          const videoStateIdToHState: LUT = cloneDeep(hsm.properties as MediaZoneHsmProperties).mediaStateIdToHState;
          videoStateIdToHState[bsdmMediaState.id] = videoHState;
          dispatch(updateHsmProperties({ id: hsmId, mediaStateIdToHState: videoStateIdToHState }));
          return videoHStateId;
        case ContentItemType.MrssFeed:
          const dataFeedContentItem: DmDataFeedContentItem = bsdmMediaState.contentItem as DmDataFeedContentItem;
          const dataFeedId: BsDmId = dataFeedContentItem.dataFeedId;
          const dataFeed: DmcDataFeed | null =
            dmGetDataFeedById(dmFilterDmState(bsPpStateFromState(getState())), { id: dataFeedId });
          if (!isNil(dataFeed)) {
            const mrssHStateId: string = dispatch(createMrssState(hsmId, bsdmMediaState, dataFeed.id, superStateId));
            const mrssHState: HState | null = getHStateById(bsPpStateFromState(getState()), mrssHStateId);
            const mrssStateIdToHState: LUT = cloneDeep(hsm.properties as MediaZoneHsmProperties).mediaStateIdToHState;
            mrssStateIdToHState[bsdmMediaState.id] = mrssHState;
            dispatch(updateHsmProperties({ id: hsmId, mediaStateIdToHState: mrssStateIdToHState }));
          }
          break;
        case ContentItemType.SuperState:
          const superStateHStateId: string = dispatch(createSuperState(hsmId, bsdmMediaState, superStateId));
          const superStateHState: HState | null =
            getHStateById(bsPpStateFromState(getState()), superStateHStateId) as HState;
          const superStateStateIdToHState: LUT =
            cloneDeep(hsm.properties as MediaZoneHsmProperties).mediaStateIdToHState;
          superStateStateIdToHState[bsdmMediaState.id] = superStateHState;
          dispatch(updateHsmProperties({ id: hsmId, mediaStateIdToHState: superStateStateIdToHState }));
          dispatch(addSuperStateContent(
            dmFilterDmState(bsPpStateFromState(getState())), superStateHState, bsdmMediaState));
          return superStateHStateId;
        default:
          return '';
      }
    }
    return '';
  });
};

const addSuperStateContent = (bsdm: DmState, superHState: HState, superStateMediaState: DmMediaState): any => {

  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {

    const superStateId: BsDmId = superStateMediaState.id;
    const mediaStateIds: BsDmId[] = dmGetContainedMediaStateIdsForMediaState(bsdm, { id: superStateId });

    for (const mediaStateId of mediaStateIds) {
      const mediaState: DmMediaState = dmGetMediaStateById(bsdm, { id: mediaStateId }) as DmMediaState;
      dispatch(createMediaHState(superHState.hsmId, mediaState, superHState.id));
    }
  });
};

export const initializeVideoOrImagesZoneHsm = (hsmId: string): BsPpVoidThunkAction => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {

    // get the initial media state for the zone
    const bsdm: DmState = dmFilterDmState(bsPpStateFromState(getState()));
    const hsm: Hsm = getHsmById(bsPpStateFromState(getState()), hsmId);
    if (hsm.type === HsmType.VideoOrImages) {

      const properties: MediaZoneHsmProperties = hsm.properties as MediaZoneHsmProperties;

      let activeState: HState | null = null;
      const initialMediaStateId: BsDmId | null =
        dmGetInitialMediaStateIdForZone(bsdm, { id: properties.zoneId });
      if (!isNil(initialMediaStateId)) {
        const initialMediaState: DmMediaState = dmGetMediaStateById(bsdm, { id: initialMediaStateId! }) as DmMediaState;
        activeState = getHStateByMediaStateId(bsPpStateFromState(getState()), hsm.id, initialMediaState.id);
      }

      dispatch(setActiveHState(hsmId, activeState));
    }
  });
};

export const videoOrImagesZoneHsmGetInitialState = (hsmId: string): BsPpAnyPromiseThunkAction => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    // console.log('videoOrImagesZoneGetInitialState');
    // console.log(bsPpStateFromState(getState()));
    const hsm: Hsm = getHsmById(bsPpStateFromState(getState()), hsmId);
    // console.log(bsPpStateFromState(getState()));
    const initialState = getHStateById(bsPpStateFromState(getState()), hsm.activeStateId);
    return Promise.resolve(initialState);
  });
};
