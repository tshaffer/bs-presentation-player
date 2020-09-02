// import log from 'electron-log';
// const log = require('electron-log');
import isomorphicPath from 'isomorphic-path';
import * as fs from 'fs-extra';
import {
  HState,
  HsmEventType,
  HStateType,
  MediaHState,
  MediaHStateData,
  MediaHStateParamsData,
  MrssStateData,
  ArDataFeed,
  ArMrssFeed,
  ArMrssItem
} from '../type';
import { dmGetMediaStateById, dmFilterDmState, DmcMediaState } from '@brightsign/bsdatamodel';
import { getDataFeedById } from '../selector';
import { Asset } from '@brightsign/assetpool';

interface LoggedHState {
  hState: HState;
  hStateExtendedData: any;
}

let writeStream: fs.WriteStream;

const events: any[] = [];

export function initLogging() {
  const logFilePath = isomorphicPath.join('/Users/tedshaffer/Library/Logs/', 'hsmEventLog.json');
  writeStream = fs.createWriteStream(logFilePath, { flags: 'w' });
}

function getHStateExtendedData(state: any, hState: HState): any {

  const hStateExtendedData: any = {};

  switch (hState.type) {
    case HStateType.Image:
    case HStateType.Video:
    case HStateType.Mrss:
      const mediaHState: MediaHState = hState as MediaHState;
      const mediaHStateData: MediaHStateData = mediaHState.data;
      const mediaStateId: string = mediaHStateData.mediaStateId;
      const mediaState: DmcMediaState =
        dmGetMediaStateById(dmFilterDmState(state), { id: mediaStateId }) as DmcMediaState;
      const name = mediaState.name;
      const contentItem = mediaState.contentItem.name;
      console.log('****** getHStateData');
      console.log('state name: ', name);          // hStateData.stateName = name
      console.log('contentItem: ');
      console.log(contentItem);

      hStateExtendedData.stateName = name;
      hStateExtendedData.contentItemName = contentItem;

      if (hState.type === HStateType.Mrss) {
        const mediaStateData: MediaHStateParamsData = mediaHStateData.mediaStateData! as MediaHStateParamsData;
        const mrssStateData: MrssStateData = mediaStateData as MrssStateData;
        const displayIndex: number = mrssStateData.displayIndex;

        const feed: ArDataFeed = getDataFeedById(state, mrssStateData.dataFeedId) as ArDataFeed;
        const mrssFeed = feed as ArMrssFeed;

        const mrssItems: ArMrssItem[] = mrssFeed.mrssItems as ArMrssItem[];
        const displayItem: ArMrssItem = mrssItems[displayIndex];
        console.log('displayItem');
        console.log(displayItem);
        hStateExtendedData.displayIndex = displayIndex;
        hStateExtendedData.displayItem = displayItem;

        const assetList: Asset[] = mrssFeed.assetList;
        const asset: Asset = assetList[displayIndex];
        console.log('asset');
        console.log(asset);
      }
      break;
    default:
      break;
  }

  return hStateExtendedData;
}

export function logHsmEvent(
  state: any,
  hStateBefore: HState,
  playerStateBefore: any,
  event: HsmEventType,
  hStateAfter: HState,
  playerStateAfter: any,
) {

  const loggedHStateBefore: LoggedHState = {
    hState: hStateBefore,
    hStateExtendedData: getHStateExtendedData(state, hStateBefore)
  };

  const loggedHStateAfter: LoggedHState = {
    hState: hStateAfter,
    hStateExtendedData: getHStateExtendedData(state, hStateAfter)
  };

  const eventDateTime = new Date();
  const eventTime: number = eventDateTime.getTime();

  const eventMsg: any = {};
  eventMsg.time = eventTime;
  eventMsg.event = event;
  eventMsg.hStateBefore = loggedHStateBefore;
  eventMsg.hsmStateBefore = playerStateBefore;
  eventMsg.hStateAfter = loggedHStateAfter;
  eventMsg.hsmStateAfter = playerStateAfter;

  events.push(eventMsg);

  // logMessage(JSON.stringify(eventMsg));

  // TEDTODO - temp test code
  if (events.length === 120) {
    const logMsg: any = {
      events
    };
    logMessage(JSON.stringify(logMsg));
  }
}

function logMessage(message: string) {
  writeStream.write(message);
}
