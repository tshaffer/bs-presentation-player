import { EventType } from '@brightsign/bscore';
import { HsmEventType } from '../../type';
import { addHsmEvent } from '../hsmController';

// -----------------------------------------------------------------------
// Controller Methods
// -----------------------------------------------------------------------

/** @internal */
/** @private */
export const postVideoEnd = (): any => {
  return (dispatch: any, getState: () => any) => {
    // console.log('postMediaEndEvent');
    const event: HsmEventType = {
      EventType: EventType.MediaEnd,
    };
    dispatch(addHsmEvent(event));
  };
};
