
import {
  createHsm,
  initializeHsm,
} from './hsm';
import { createHState } from './hState';
import {
  getHsmByName,
  getHStateByName,
} from '../../selector/hsm';
import {
  HState,
  HsmType,
  HStateType,
  HsmEventType,
  HSMStateData,
  bsPpStateFromState,
} from '../../type';
import {
  BsPpAnyPromiseThunkAction,
} from '../../model';
import { isNil } from 'lodash';
import { setHsmTop } from '../../model';

import {
  BsPpState,
  // PpSchedule,
} from '../../type';
import {
  BsPpDispatch,
  BsPpVoidThunkAction,
  BsPpVoidPromiseThunkAction,
} from '../../model';

import {
  // getAutoschedule,
  // getSyncSpecFileMap,
  // getSrcDirectory,
  getZoneHsmList,
  // getSyncSpecReferencedFile,
} from '../../selector';
import {
  BsDmId,
  // DmSignState,
  // dmOpenSign,
  DmState,
  dmGetZoneById,
  DmZone,
  dmGetZonesForSign,
} from '@brightsign/bsdatamodel';
import { hsmConstructorFunction } from '../hsm/eventHandler';
import { createMediaZoneHsm } from './mediaZoneHsm';
import { getIsHsmInitialized } from '../../selector';
import { addHsmEvent } from '../hsmController';
import { openSign } from '../appController';
import {
  DmDataFeedSource,
  dmGetDataFeedIdsForSign,
  DmcDataFeed,
  dmGetDataFeedById,
  dmGetDataFeedSourceForFeedId
} from '@brightsign/bsdatamodel';
import {
  downloadMRSSFeedContent,
  retrieveDataFeed,
  readCachedFeed,
  downloadContentFeedContent,
  processFeed
} from '../dataFeed';
import { DataFeedUsageType } from '@brightsign/bscore';
import { ArContentFeed, ArMrssFeed, ArDataFeed } from '../../type/dataFeed';
import { getDataFeedById } from '../../selector/dataFeed';

export const createPlayerHsm = (): any => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    console.log('invoke createPlayerHsm');
    const playerHsmId: string = dispatch(createHsm('player', HsmType.Player, {}));

    const stTopId = dispatch(createHState(
      HStateType.Top,
      playerHsmId,
      '',
      'top'
    ));

    dispatch(setHsmTop(playerHsmId, stTopId));

    const stPlayerId = dispatch(createHState(HStateType.Player, playerHsmId, stTopId, 'player'));

    dispatch(createHState(HStateType.Playing, playerHsmId, stPlayerId, 'playing'));

    dispatch(createHState(HStateType.Waiting, playerHsmId, stPlayerId, 'waiting'));
  });
};

export const initializePlayerHsm = (): any => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    console.log('invoke initializePlayerHsm');
    const playerHsm = getHsmByName(bsPpStateFromState(getState()), 'player');
    if (!isNil(playerHsm)) {
      dispatch(initializeHsm(playerHsm!.id));
    }
  });
};

export const playerHsmGetInitialState = (): BsPpAnyPromiseThunkAction => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    console.log('invoke playerHsmGetInitialState');
    return dispatch(launchSchedulePlayback(''))
      .then(() => {
        console.log('return from invoking playerHsmGetInitialState restartPlayback');
        const hState = getHStateByName(bsPpStateFromState(getState()), 'playing');
        return Promise.resolve(hState);
      });
  });
};

export const STPlayerEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): any => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    stateData.nextStateId = hState.superStateId;

    console.log('***** - STPlayerEventHandler, event type ' + event.EventType);

    return 'SUPER';
  });
};

export const STPlayingEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): any => {

  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    stateData.nextStateId = null;

    console.log('***** - STPlayingEventHandler, event type ' + event.EventType);

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      console.log(hState.id + ': entry signal');

      const action: any = launchPresentationPlayback();
      dispatch(action);

      return 'HANDLED';
    } else if (isString(event.EventType) && (event.EventType === 'MRSS_DATA_FEED_LOADED') || (event.EventType === 'CONTENT_DATA_FEED_LOADED') || (event.EventType === 'CONTENT_DATA_FEED_UNCHANGED')) {
      dispatch(advanceToNextDataFeedInQueue(getState().bsdm).bind(this));
      return 'HANDLED';
    }

    stateData.nextStateId = hState.superStateId;
    return 'SUPER';
  });
};

export const STWaitingEventHandler = (
  hState: HState,
  event: HsmEventType,
  stateData: HSMStateData
): any => {

  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    stateData.nextStateId = null;

    if (event.EventType && event.EventType === 'ENTRY_SIGNAL') {
      console.log(hState.id + ': entry signal');
      return 'HANDLED';
    } else if (event.EventType && event.EventType === 'TRANSITION_TO_PLAYING') {
      console.log(hState.id + ': TRANSITION_TO_PLAYING event received');
      // const hsmId: string = hState.hsmId;
      // const hsm: PpHsm = getHsmById(bsPpStateFromBaApUiState(getState()), hsmId);
      const stPlayingState: HState | null = getHStateByName(bsPpStateFromState(getState()), 'Playing');
      if (!isNil(stPlayingState)) {
        stateData.nextStateId = stPlayingState!.id;
        return 'TRANSITION';
      }
      debugger;
    }

    stateData.nextStateId = hState.superStateId;
    return 'SUPER';
  });
};

export const launchSchedulePlayback = (presentationName: string): BsPpVoidPromiseThunkAction => {
  console.log('invoke restartPlayback');

  return (dispatch: BsPpDispatch, getState: () => BsPpState) => {
    const action = openSign(presentationName);
    const promise = dispatch(action as any);
    return promise;

    // const autoSchedule: PpSchedule | null = getAutoschedule(bsPpStateFromState(getState()));
    // if (!isNil(autoSchedule)) {
    //   //  - only a single scheduled item is currently supported
    //   const scheduledPresentation = autoSchedule!.scheduledPresentations[0];
    //   const presentationToSchedule = scheduledPresentation.presentationToSchedule;
    //   presentationName = presentationToSchedule.name;
    //   const autoplayFileName = presentationName + '.bml';

    //   const syncSpecFileMap = getSyncSpecFileMap(bsPpStateFromState(getState()));
    //   if (!isNil(syncSpecFileMap)) {
    //     return getSyncSpecReferencedFile(autoplayFileName, syncSpecFileMap!,
    // getSrcDirectory(bsPpStateFromState(getState())))
    //       .then((bpfxState: any) => {
    //         const autoPlay: any = bpfxState.bsdm;
    //         const signState = autoPlay as DmSignState;
    //         dispatch(dmOpenSign(signState));
    //       });
    //   }
    //   return Promise.resolve();
    // } else {
    //   return Promise.resolve();
    // }
  };
};

export const launchPresentationPlayback = (): BsPpVoidThunkAction => {
  console.log('invoke startPlayback');

  return (dispatch: BsPpDispatch, getState: () => BsPpState) => {

    const bsdm: DmState = bsPpStateFromState(getState()).bsdm;
    console.log('startPlayback');
    console.log(bsdm);

    const zoneIds: BsDmId[] = dmGetZonesForSign(bsdm);
    zoneIds.forEach((zoneId: BsDmId) => {
      const bsdmZone: DmZone = dmGetZoneById(bsdm, { id: zoneId }) as DmZone;
      dispatch(createMediaZoneHsm(zoneId, bsdmZone.type.toString(), bsdmZone));
    });

    const promises: Array<Promise<void>> = [];

    const zoneHsmList = getZoneHsmList(bsPpStateFromState(getState()));
    for (const zoneHsm of zoneHsmList) {
      dispatch(hsmConstructorFunction(zoneHsm.id));
      const action: BsPpVoidPromiseThunkAction = initializeHsm(zoneHsm.id);
      promises.push(dispatch(action));
    }

    Promise.all(promises).then(() => {
      console.log('startPlayback nearly complete');
      console.log('wait for HSM initialization complete');
      const hsmInitializationComplete = getIsHsmInitialized(bsPpStateFromState(getState()));
      if (hsmInitializationComplete) {
        const event: HsmEventType = {
          EventType: 'NOP',
        };
        dispatch(addHsmEvent(event));
      }
    });

  };
};

// ids of dataFeeds to download
const bsdmDataFeedIdsToDownload: BsDmId[] = [];

export function advanceToNextDataFeedInQueue(bsdm: DmState) {
  return (dispatch: any, getState: any) => {
    this.bsdmDataFeedIdsToDownload.shift();

    if (this.bsdmDataFeedIdsToDownload.length > 0) {
      const bsdmDataFeedId = this.bsdmDataFeedIdsToDownload[0];
      dispatch(this.retrieveAndProcessDataFeed(bsdm, bsdmDataFeedId));
    }
  };
}

export function queueRetrieveDataFeed(bsdm: DmState, bsdmDataFeedId: BsDmId) {
  return (dispatch: any, getState: any) => {
    const bsdmDataFeed: DmcDataFeed | null = dmGetDataFeedById(bsdm, { id: bsdmDataFeedId }) as DmcDataFeed;
    if (!isNil(bsdmDataFeed)) {
      if (bsdmDataFeed.usage === DataFeedUsageType.Text) {
        dispatch(this.retrieveAndProcessDataFeed(bsdm, bsdmDataFeedId));
      } else {
        this.bsdmDataFeedIdsToDownload.push(bsdmDataFeedId);
        if (this.bsdmDataFeedIdsToDownload.length === 1) {
          dispatch(this.retrieveAndProcessDataFeed(bsdm, bsdmDataFeedId));
        }
      }
    }
  };
}

export function launchRetrieveFeedTimer(dataFeedId: BsDmId, bsdm: DmState): any {
  return (dispatch: any, getState: any) => {

    const dataFeedSource = dmGetDataFeedSourceForFeedId(bsdm, { id: dataFeedId }) as DmDataFeedSource;
    let updateInterval = dataFeedSource.updateInterval;

    // test
    updateInterval = 60;

    setTimeout(this.retrieveFeedTimeoutHandler.bind(this), updateInterval * 1000, dispatch, this, dataFeedId, bsdm);
  };
}

export function retrieveFeedTimeoutHandler(dispatch: any, playerHSM: PlayerHSM, dataFeedId: BsDmId, bsdm: DmState): any {
  dispatch(this.queueRetrieveDataFeed(bsdm, dataFeedId));
}

function readCachedFeeds(bsdm: DmState) {

  return (dispatch: any) => {

    const bsdmDataFeedIds: BsDmId[] = dmGetDataFeedIdsForSign(bsdm);

    const readNextCachedFeed = (index: number): Promise<void> => {

      if (index >= bsdmDataFeedIds.length) {
        return Promise.resolve();
      }

      const bsdmDataFeedId = bsdmDataFeedIds[index];
      const bsdmDataFeed: DmcDataFeed | null = dmGetDataFeedById(bsdm, { id: bsdmDataFeedId }) as DmcDataFeed;
      return (readCachedFeed(bsdmDataFeed))
        .then((rawFeed: any) => {
          if (!isNil(rawFeed)) {
            // const promise = dispatch(processFeed(bsdmDataFeed, rawFeed));
            dispatch(processFeed(bsdmDataFeed, rawFeed));
            // TODO - wait for promise to get resolved before starting next one?
          }
          return readNextCachedFeed(index + 1);
        }).catch((error: Error) => {
          console.log(error);
          debugger;
        });
    };

    return readNextCachedFeed(0);
  };
}

function fetchFeeds(bsdm: DmState) {
  return (dispatch: any, getState: any) => {
    const bsdmDataFeedIds: BsDmId[] = dmGetDataFeedIdsForSign(bsdm);
    for (const bsdmDataFeedId of bsdmDataFeedIds) {
      dispatch(this.queueRetrieveDataFeed(bsdm, bsdmDataFeedId));
    }
  };
}

function retrieveAndProcessDataFeed(bsdm: DmState, bsdmDataFeedId: BsDmId) {
  return (dispatch: any, getState: any) => {
    const bsdmDataFeed: DmcDataFeed | null = dmGetDataFeedById(bsdm, { id: bsdmDataFeedId }) as DmcDataFeed;
    // const feedFileName: string = getFeedCacheRoot() + bsdmDataFeed.id + '.xml';
    retrieveDataFeed(bsdm, bsdmDataFeed)
      .then((rawFeed) => {
        dispatch(processFeed(bsdmDataFeed, rawFeed))
          .then(() => {
            // TYPESCRIPT issues
            const arDataFeed = getDataFeedById(getState(), bsdmDataFeed.id) as ArDataFeed;
            if (arDataFeed.type === 'content') {
              dispatch(downloadContentFeedContent(arDataFeed as ArContentFeed));
            } else if (arDataFeed.type === 'mrss') {
              dispatch(downloadMRSSFeedContent(arDataFeed as ArMrssFeed));
            } else if (arDataFeed.type === 'text') {
              console.log('text feed: return from processFeed - no content to download');
            } else {
              debugger;
            }

            const event: ArEventType = {
              EventType: 'LIVE_DATA_FEED_UPDATE',
              EventData: bsdmDataFeedId,
            };
            const action: any = (this.stateMachine as PlayerHSM).postMessage(event);
            dispatch(action);

            dispatch(this.launchRetrieveFeedTimer(bsdmDataFeedId, bsdm).bind(this));

          }).catch((err: any) => {
            console.log(err);
          });
      });
  };
}


