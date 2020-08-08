
import { Asset } from '@brightsign/assetpool';
import { BsDmId } from '@brightsign/bsdatamodel';
import { DataFeedUsageType } from '@brightsign/bscore';

export interface ArFeed {
  rss: any;
  // for a text feed
  //    #name: string
  //    $: object
  //    $$: Array[]
  //    channel: object
}

export interface ArDataFeedBase {
  type: string;
  id: BsDmId;
  sourceId: BsDmId;
  usage: DataFeedUsageType;
}

export interface ArTextItem {
  articleTitle: string;
  articleDescription: string;
}

export interface ArTextFeedProperties {
  textItems: ArTextItem[];
  articlesByTitle: any; // title => ArTextItem
}

export interface ArMrssItem {
  guid: string;
  link: string;
  title: string;
  pubDate: string;
  duration: string;
  fileSize: string;
  medium: string;
  type: string;
  url: string;
  filePath?: string;
}

export interface ArMrssFeedProperties {
  mrssItems: ArMrssItem[];
  title: string;
  playtime: string;
  ttl: string;
  assetList: Asset[];
}

export interface ArContentFeedItem {
  name: string;
  url: string;
  medium: string;
  hash: string;
}

export interface ArContentFeedProperties {
  contentItems: ArContentFeedItem[];
  assetList: Asset[];
}

export interface ArMediaFeedItem {
  filePath: string;
  medium: string;
}

export type ArDataFeed = ArTextFeed | ArMrssFeed | ArContentFeed;

export type ArTextFeed = ArDataFeedBase & ArTextFeedProperties;

export type ArMrssFeed = ArDataFeedBase & ArMrssFeedProperties;
export type ArContentFeed = ArDataFeedBase & ArContentFeedProperties;

export interface ArDataFeedMap {
  [dataFeedId: string]: ArDataFeed;
}
