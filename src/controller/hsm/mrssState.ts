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
  HsmTimerType,
  // ArDataFeed,
} from '../../type';
import {
  BsPpDispatch,
  BsPpStringThunkAction,
  BsPpVoidThunkAction,
  setMediaHStateParameter,
} from '../../model';
import { Asset } from '@brightsign/assetpool';
import { createHState, createHStateSpecification } from './hState';
import { launchTimer, mediaHStateExitHandler, mediaHStateEventHandler } from './mediaHState';
import {
  getDataFeedById,
  allDataFeedContentExists,
  dataFeedContentExists,
  // feedPoolFileExists,
  getFeedPoolFilePathFromAsset,
  getHStateById
} from '../../selector';
import { isNil, isString, isNumber } from 'lodash';
import { addHsmEvent } from '../hsmController';
import { EventType } from '@brightsign/bscore';
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
      // console.log('STMrssStateEventHandler: entry signal');

      const mediaHState: MediaHState = hState as MediaHState;

      dispatch(setMediaHStateParameter(mediaHState.id, 'waitForContentTimer', null));
      dispatch(setMediaHStateParameter(mediaHState.id, 'firstItemDisplayed', false));
      dispatch(setMediaHStateParameter(mediaHState.id, 'currentFeedId', null));
      dispatch(setMediaHStateParameter(mediaHState.id, 'pendingFeedId', null));

      // // see if the designated feed has already been downloaded (doesn't imply content exists)
      // // TODODF - does the code below properly check to see if the designated feed has been downloaded?
      // console.log('mrssState.ts#STDisplayingMrssStateEventHandler: dataFeedId');
      // console.log((mediaHState.data.mediaStateData! as MrssStateData).dataFeedId);

      // // get the data feed associated with the state
      const dataFeedId: string = (mediaHState.data.mediaStateData! as MrssStateData).dataFeedId;
      const dataFeed: ArDataFeed | null = getDataFeedById(getState(), dataFeedId) as ArMrssFeed;

      if (!isNil(dataFeed)) {
        // create local versions of key objects
        // m.assetCollection = m.liveDataFeed.assetCollection
        // m.assetPoolFiles = m.liveDataFeed.assetPoolFiles
        dispatch(setMediaHStateParameter(mediaHState.id, 'currentFeedId', dataFeed.id));

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
          dispatch(advanceToNextMRSSItem(hState.id));
        }

      }
      dispatch(launchTimer(hState));
      return 'HANDLED';
    } else if (event.EventType === 'Timer') {
      // event.data === mrssState.id
      dispatch(advanceToNextMRSSItem(event.data));
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

export const advanceToNextMRSSItem = (hStateId: string) => {

  return (dispatch: any, getState: any) => {

    // TEDTODO - asserting that hState is not null.
    const hState: HState | null = getHStateById(bsPpStateFromState(getState()), hStateId);

    // console.log('************ AdvanceToNextMRSSItem');

    const mediaHState: MediaHState = hState as MediaHState;
    const mrssStateData: MrssStateData = mediaHState.data.mediaStateData! as MrssStateData;

    let displayedItem = false;

    while (!displayedItem) {

      if (!isNil(mrssStateData.currentFeedId)) {
        const feed: ArDataFeed | null = getDataFeedById(getState(), mrssStateData.currentFeedId);
        if (!isNil(feed)) {

          let currentFeed = feed as ArMrssFeed;
          let dataFeedItems = currentFeed.mrssItems as ArMrssItem[];

          let displayIndex = mrssStateData.displayIndex;
          if (displayIndex >= dataFeedItems.length) {

            displayIndex = 0;
            dispatch(setMediaHStateParameter(mediaHState.id, 'displayIndex', 0));

            if (!isNil(mrssStateData.pendingFeedId)) {

              currentFeed = getDataFeedById(getState(), mrssStateData.pendingFeedId) as ArMrssFeed;
              dispatch(setMediaHStateParameter(mediaHState.id, 'currentFeedId', mrssStateData.currentFeedId));
              dispatch(setMediaHStateParameter(mediaHState.id, 'pendingFeedId', null));

              // protect the feed that we're switching to (see autorun.brs)

              // check to see if the feed it switched to is empty OR doesn't have all its content
              if (dataFeedItems.length === 0 || (!allDataFeedContentExists(getState(), currentFeed))) {
                // if true, if it has some content, play it.
                if (dataFeedContentExists(getState(), currentFeed)) {
                  if (isNil(displayIndex)) {
                    displayIndex = 0;
                    dispatch(setMediaHStateParameter(mediaHState.id, 'displayIndex', 0));
                  }
                  // TODO - is this right? calls itself?
                  dispatch(advanceToNextMRSSItem(mediaHState.id));
                } else {
                  dispatch(launchWaitForContentTimer(mediaHState));
                }
              }
            }
          }

          dataFeedItems = currentFeed.mrssItems as ArMrssItem[];
          const displayItem: ArMrssItem = dataFeedItems[displayIndex];
          // const filePath: string = feedPoolFileExists(getState(), displayItem.guid.toLowerCase());
          // TEDTODO - clear confusion between assetList and mrssItems
          const asset: Asset = currentFeed.assetList[displayIndex];
          const filePath = getFeedPoolFilePathFromAsset(getState(), asset);

          if (isString(filePath) && filePath.length > 0) {
            displayItem.filePath = filePath;
            dispatch(displayMRSSSItem(mediaHState, displayItem));
            displayedItem = true;
          }
          displayIndex++;

          // TEDTODO - temporary hack that
          //    results in displaying the second item first (instead of the first item)
          //    breaks support for multiple feeds for a state
          if (displayIndex >= dataFeedItems.length) {
            displayIndex = 0;
          }

          dispatch(setMediaHStateParameter(mediaHState.id, 'displayIndex', displayIndex));
        }
      }
    }
  };
};

export const displayMRSSSItem = (mrssState: MediaHState, displayItem: ArMrssItem) => {

  return (dispatch: any, getState: any) => {

    console.log('displayMRSSItem');

    // TEDTODO - does it need to do anything?
    // TEDTODO - or is the display based on displayIndex, which was already set?

    // const filePath: string = getFeedPoolFilePath(displayItem.guid.toLowerCase());

    // const mediaZoneHSM: MediaZoneHSM = this.stateMachine as MediaZoneHSM;
    // dispatch(setActiveMrssDisplayItem(mediaZoneHSM.zoneId, displayItem));

    if (displayItem.medium === 'image') {
      dispatch(launchMrssTimer(mrssState));
    }
  };
};

interface TimeoutEventCallbackParams {
  dispatch: BsPpDispatch;
  getState: any;
  mrssState: MediaHState;
}

export const launchWaitForContentTimer = (mrssState: MediaHState): any => {
  return (dispatch: any, getState: any) => {

    console.log('launchWaitForContentTimer');

    let waitForContentTimer: any = (mrssState.data.mediaStateData! as MrssStateData).waitForContentTimer;

    if (isNumber(waitForContentTimer)) {
      clearTimeout(waitForContentTimer);
    }

    const timeoutDuration: number = 1;
    const timeoutEventCallbackParams: TimeoutEventCallbackParams = {
      dispatch,
      getState,
      mrssState,
    };

    waitForContentTimer = setTimeout(waitForContentTimeoutHandler, timeoutDuration * 1000, timeoutEventCallbackParams);
    dispatch(setMediaHStateParameter(mrssState.id, 'waitForContentTimer', waitForContentTimer));
  };
};

export const waitForContentTimeoutHandler = (dispatch: any, getState: any, mrssState: MediaHState) => {

  console.log('************ waitForContentTimeoutHandler');

  const mrssStateData: MrssStateData = mrssState.data.mediaStateData! as MrssStateData;

  if (!isNil(mrssStateData.currentFeedId)) {
    const currentFeed: ArMrssFeed = getDataFeedById(getState(), mrssStateData.currentFeedId) as ArMrssFeed;
    const dataFeedItems = currentFeed.mrssItems as ArMrssItem[];
    if ((dataFeedItems.length === 0 || (!allDataFeedContentExists(getState(), currentFeed)))) {
      if (dataFeedContentExists(getState(), currentFeed)) {
        if (isNil(mrssStateData.displayIndex)) {
          mrssStateData.displayIndex = 0;
        }
        dispatch(advanceToNextMRSSItem(mrssState.id));
      } else {
        dispatch(launchWaitForContentTimer(mrssState));
      }
    }
  }
};

// TEDTODO - mediaHState or displayItem or ??
export const launchMrssTimer = (mrssState: MediaHState): any => {

  return (dispatch: any, getState: any) => {
    console.log('launchMrssTimer');
    const interval: number = 3;
    const timeoutEventCallbackParams: TimeoutEventCallbackParams = {
      dispatch,
      getState,
      mrssState,
    };

    if (interval && interval > 0) {
      // const timeout = setTimeout(mrssTimeoutHandler, interval * 1000, timeoutEventCallbackParams);
      setTimeout(mrssTimeoutHandler, interval * 1000, timeoutEventCallbackParams);
    }
  };
};

// equivalent to   'else if type(event) = "roTimerEvent" then' in autorun
export const mrssTimeoutHandler = (callbackParams: TimeoutEventCallbackParams) => {

  // TEDTODO - identify which mrssState
  const event: HsmEventType = {
    EventType: EventType.Timer,
    EventData: HsmTimerType.MrssState,
    data: callbackParams.mrssState.id,
  };

  callbackParams.dispatch(addHsmEvent(event));

  // callbackParams.dispatch(advanceToNextMRSSItem(callbackParams.mrssState.id));

  // console.log('mrssTimeoutHandler');
  // const atEndOfMrssFeed = atEndOfFeed(mrssState);
  // const endOfFeed = atEndOfFeed();
  // if (endOfFeed) {
  //   console.log('******* - cc28');

  //   const event: ArEventType = {
  //     EventType: 'EndOfFeed',
  //   };
  //   reduxStore.dispatch(mrssState.stateMachine.dispatchEvent(event));
  //   // return dispatch(this.mediaHStateEventHandler(event, stateData));

  // }
  // else {
  //   console.log('******* - cc29');

  //   reduxStore.dispatch(mrssState.advanceToNextMRSSItem().bind(mrssState));
  // }

};

//  need to also consider the case where it's not at the end but there's no more content.
export const atEndOfFeed = (mrssState: MediaHState): boolean => {
  // console.log('atEndOfFeed');
  return false;
};
