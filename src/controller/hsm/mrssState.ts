import { DmMediaState } from '@brightsign/bsdatamodel';
import {
  HStateType,
  HState,
  HsmEventType,
  HSMStateData,
  MediaHState,
  MrssStateData,
  ArMrssFeed,
  ArDataFeed,
  ArMrssItem,
  bsPpStateFromState,
  // ArDataFeed,
} from '../../type';
import {
  BsPpDispatch,
  BsPpStringThunkAction,
  BsPpVoidThunkAction,
  setMediaHStateParameter,
} from '../../model';
import { createHState, createHStateSpecification } from './hState';
import { launchTimer, mediaHStateExitHandler, mediaHStateEventHandler } from './mediaHState';
import { getDataFeedById, allDataFeedContentExists } from '../../selector';
import { isNil } from 'lodash';
import { addHsmEvent } from '../hsmController';
// import { getDataFeedById } from '../../selector';

export const createMrssState = (
  hsmId: string,
  mediaState: DmMediaState,
  dataFeedId: string,
  superStateId: string,
): BsPpStringThunkAction => {
  return ((dispatch: BsPpDispatch) => {
    const mrssStateId: string = dispatch(createHState(
      createHStateSpecification(
        HStateType.Mrss,
        hsmId,
        superStateId,
        '',
      ),
      {
        mediaStateId: mediaState.id,
        mediaStateData: {
          dataFeedId,
          currentFeedId: null,
          pendingFeedId: null,
          displayIndex: 0,
          firstItemDisplayed: false,
          waitForContentTimer: null,
        }
      },
    ));
    return mrssStateId;
  });
};

export const STMrssStateEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): BsPpVoidThunkAction => {
  return (dispatch: BsPpDispatch, getState: any) => {
    if (event.EventType === 'ENTRY_SIGNAL') {
      console.log('STMrssStateEventHandler: entry signal');

      const mediaHState: MediaHState = hState as MediaHState;

      dispatch(setMediaHStateParameter(mediaHState.id, 'waitForContentTimer', null));
      dispatch(setMediaHStateParameter(mediaHState.id, 'firstItemDisplayed', false));
      dispatch(setMediaHStateParameter(mediaHState.id, 'currentFeed', null));
      dispatch(setMediaHStateParameter(mediaHState.id, 'pendingFeed', null));

      // // see if the designated feed has already been downloaded (doesn't imply content exists)
      // // TODODF - does the code below properly check to see if the designated feed has been downloaded?
      console.log('mrssState.ts#STDisplayingMrssStateEventHandler: dataFeedId');
      console.log((mediaHState.data.mediaStateData! as MrssStateData).dataFeedId);

      // // get the data feed associated with the state
      const dataFeedId: string = (mediaHState.data.mediaStateData! as MrssStateData).dataFeedId;
      const dataFeed: ArDataFeed | null = getDataFeedById(getState(), dataFeedId) as ArMrssFeed;

      if (!isNil(dataFeed)) {
        // create local versions of key objects
        // m.assetCollection = m.liveDataFeed.assetCollection
        // m.assetPoolFiles = m.liveDataFeed.assetPoolFiles
        dispatch(setMediaHStateParameter(mediaHState.id, 'currentFeed', dataFeed));

        // TODODF - protect the feed that is getting displayed
        // m.ProtectMRSSFeed("display-" + m.liveDataFeed.id$, m.assetCollection)

        dispatch(setMediaHStateParameter(mediaHState.id, 'displayIndex', 0));

        // distinguish between a feed that has no content and a feed in which no content has been downloaded
        const dataFeedItems = dataFeed.mrssItems as ArMrssItem[];
        if (dataFeedItems.length === 0 || (!allDataFeedContentExists(bsPpStateFromState(getState()), dataFeed))) {
          // **** I'm surprised that it exits if it doesn't have all content - that seems contradictory to other spots
          // **** where it plays whatever is available.

          // no content in feed - send a message to self to trigger exit from state (like video playback failure)
          const mrssNotFullyLoadedPlaybackEvent: HsmEventType = {
            EventType: 'MRSSNotFullyLoadedPlaybackEvent',
            EventData: dataFeed.id,
          };
          dispatch(addHsmEvent(mrssNotFullyLoadedPlaybackEvent));
        } else {
          dispatch(advanceToNextMRSSItem());
        }

      }
      dispatch(launchTimer(hState));
      return 'HANDLED';
    } else if (event.EventType === 'EXIT_SIGNAL') {
      dispatch(mediaHStateExitHandler(hState.id));
      stateData.nextStateId = hState.superStateId;
      return 'SUPER';
    } else {
      return dispatch(mediaHStateEventHandler(hState, event, stateData));
    }
  };
};

// bases operations on currentFeed
// simple case, plays the item pointed to by displayIndex - increments displayIndex
// if displayIndex >= numItems in feed, reset index to 0. checks for existence of pendingFeed
// if pending feed is not nil, it sets current feed to pending feed, and sets pending feed to null

export const advanceToNextMRSSItem = () => {

  return (dispatch: any, getState: any) => {

    console.log('************ AdvanceToNextMRSSItem');

    // let displayedItem = false;

    // while (!displayedItem) {

    //   if (!isNil(this.currentFeed)) {

    // }
  };
};

export const displayMRSSSItem = (displayItem: ArMrssItem) => {

  return (dispatch: any, getState: any) => {

    console.log('displayMRSSItem');
    // const filePath: string = getFeedPoolFilePath(displayItem.guid.toLowerCase());

    // const mediaZoneHSM: MediaZoneHSM = this.stateMachine as MediaZoneHSM;
    // dispatch(setActiveMrssDisplayItem(mediaZoneHSM.zoneId, displayItem));

    // if (displayItem.medium === 'image') {
    //   dispatch(this.launchMrssTimer());
    // }
  };
};

export const launchWaitForContentTimer = (): any => {
  return (dispatch: any, getState: any) => {
    console.log('launchWaitForContentTimer');
    // if (isNumber(this.waitForContentTimer)) {
    //   console.log('******* - cc22');
    //   clearTimeout(this.waitForContentTimer);
    // }

    // console.log('************ launchWaitForContentTimer');

    // const timeoutDuration: number = 1;
    // this.waitForContentTimer = setTimeout(this.waitForContentTimeoutHandler, timeoutDuration * 1000, dispatch, this);
  };
};

export const waitForContentTimeoutHandler = (dispatch: any, mrssState: any) => {
  console.log('************ waitForContentTimeoutHandler');
};

export const launchMrssTimer = (): any => {

  return (dispatch: any, getState: any) => {
    console.log('launchMrssTimer');
  };
};

// equivalent to   'else if type(event) = "roTimerEvent" then' in autorun
export const mrssTimeoutHandler = (mrssState: any) => {
  console.log('mrssTimeoutHandler');
};

//  need to also consider the case where it's not at the end but there's no more content.
export const atEndOfFeed = (): boolean => {
  console.log('atEndOfFeed');
  return false;
};
