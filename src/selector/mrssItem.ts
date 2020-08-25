import { getHStateByMediaStateId } from './hsm';
import {
  MediaHState,
  MediaHStateData,
  BsPpModelState,
  MrssStateData,
  ArMrssFeed,
  ArDataFeedMap,
} from '../type';
import { Asset } from '@brightsign/assetpool';

import { getHsmById } from './hsm';
import { Hsm } from '../type';
import { getFeedPoolFilePath } from './presentation';

export function getMrssItemFilePath(state: any, mediaStateId: string): string {

  const hsmById = state.bsPlayer.hsmState.hsmById;
  const hsmIds = Object.keys(hsmById);
  for (const hsmId of hsmIds) {
    const hsm: Hsm = getHsmById(state, hsmId);
    if (hsm.type === 'VideoOrImages') {
      const mediaHState: MediaHState = getHStateByMediaStateId(state, hsm.id, mediaStateId) as MediaHState;
      // console.log(mediaHState);
      const data: MediaHStateData = mediaHState.data;
      const mediaStateData = data.mediaStateData!;
      // console.log(mediaStateData);

      const bsPlayer: BsPpModelState = state.bsPlayer;
      const arDataFeeds: ArDataFeedMap = bsPlayer.arDataFeeds;
      const arMrssFeed: ArMrssFeed = arDataFeeds[(mediaStateData as MrssStateData).dataFeedId] as ArMrssFeed;

      const displayIndex: number = (mediaStateData as MrssStateData).displayIndex;

      const asset: Asset = arMrssFeed.assetList[displayIndex];

      const filePath = getFeedPoolFilePath(state, asset.hash!.hex);

      return filePath;
    }
  }

  return '';
}
