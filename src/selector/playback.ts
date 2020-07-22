// ------------------------------------
// Selectors

import { BsPpState } from '../type';
import { isNil } from 'lodash';

// ------------------------------------
export function getVideoRef(state: BsPpState): HTMLVideoElement | null {
  debugger;
  if (
    !isNil(state.bsPlayer)
    && !isNil(state.bsPlayer.playback)) {
    return state.bsPlayer.playback.videoElementRef;
  }
  return null;
}
