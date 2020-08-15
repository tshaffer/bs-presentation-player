import { HStateSpecification, HStateType, MediaHState, MediaHStateData } from '../../type';
import { addHState, AddHStateOptions } from '../../model';
import { newBsPpId } from '../../utility';
import {
  BsPpDispatch,
  BsPpStringThunkAction,
} from '../../model';

export const createHState = (
  type: string,
  hsmId: string,
  superStateId: string,
  name: string,
  options?: AddHStateOptions,
): BsPpStringThunkAction => {
  return ((dispatch: BsPpDispatch) => {
    const id: string = newBsPpId();
    const hStateSpecification: HStateSpecification = {
      id,
      type,
      hsmId,
      superStateId,
      name,
    };
    dispatch(addHState(hStateSpecification, options));
    return id;
  });
};

export const createHState2 = (
  type: string,
  hsmId: string,
  superStateId: string,
  name: string,
  options?: AddHStateOptions,
): BsPpStringThunkAction => {
  return ((dispatch: BsPpDispatch) => {
    const id: string = newBsPpId();
    const hStateSpecification: HStateSpecification = {
      id,
      type,
      hsmId,
      superStateId,
      name,
    };
    dispatch(addHState(hStateSpecification, options));
    return id;
  });
};

export const createStateDataForStateType = (
  stateType: HStateType,
  mediaHState: MediaHState,
): MediaHStateData | null => {
  switch (stateType) {
    case HStateType.Mrss: {
      const mediaStateData: MediaHStateData = {
        dataFeedId: mediaHState.mediaStateData!.dataFeedId as string,
        currentFeedId: null,
        pendingFeedId: null,
        displayIndex: 0,
        firstItemDisplayed: false,
        waitForContentTimer: null,
      };
      return mediaStateData;
    }
    default: {
      break;
    }
  }

  return null;
};
