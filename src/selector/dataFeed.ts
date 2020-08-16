import * as fs from 'fs-extra';
import { ArDataFeed, ArMrssItem, ArMrssFeed, ArContentFeed, bsPpStateFromState } from '../type';
import { Hash, Asset } from '@brightsign/assetpool';
import { getFeedPoolFilePath } from './presentation';

// ------------------------------------
// Selectors
// ------------------------------------
// TEDTODO - create selector?
export function getDataFeedById(state: any, dataFeedId: string): ArDataFeed | null {
  const dataFeedsById = bsPpStateFromState(state).bsPlayer.arDataFeeds;
  return dataFeedsById[dataFeedId];
}

export function getMrssFeedItems(feed: any): ArMrssItem[] {

  const feedItems: ArMrssItem[] = [];

  const items: any = feed.rss.channel.item;
  for (const item of items) {
    const mediaContent: any = item['media:content'].$;
    const feedItem: ArMrssItem = {
      guid: item.guid,
      link: item.link,
      title: item.title,
      pubDate: item.pubDate,
      duration: mediaContent.duration,
      fileSize: mediaContent.fileSize,
      medium: mediaContent.medium,
      type: mediaContent.type,
      url: mediaContent.url,
    };

    feedItems.push(feedItem);
  }
  return feedItems;
}

export function allDataFeedContentExists(state: any, dataFeed: ArMrssFeed | ArContentFeed): boolean {
  for (const asset of dataFeed.assetList as Asset[]) {
    const filePath = getFeedPoolFilePathFromAsset(state, asset);
    if (filePath === '' || !fs.existsSync(filePath)) {
      return false;
    }
  }
  return true;
}

export function dataFeedContentExists(state: any, dataFeed: ArMrssFeed): boolean {
  for (const asset of dataFeed.assetList as Asset[]) {
    const filePath = getFeedPoolFilePathFromAsset(state, asset);
    if (filePath !== '' && fs.existsSync(filePath)) {
      return true;
    }
  }
  return false;
}

export function getFeedPoolFilePathFromAsset(state: any, asset: Asset): string {

  const hash = asset.hash as Hash;
  if (hash.method !== 'SHA1' && hash.method !== 'nohash') {
    return '';
  }
  return getFeedPoolFilePath(state, hash.hex);
}
