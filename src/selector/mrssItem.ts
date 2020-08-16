// import { DmMediaState, dmGetMediaStateById, DmState, dmFilterDmState } from '@brightsign/bsdatamodel';
import { getHStateByMediaStateId } from './hsm';
import { HState, MediaHState, MediaHStateData } from '../type';

import { getHsmById } from './hsm';
import { Hsm } from '../type';

export function getMrssItemFilePath(state: any, mediaStateId: string): string {

  const hsmById = state.bsPlayer.hsmState.hsmById;
  const hsmIds = Object.keys(hsmById);
  for (const hsmId of hsmIds) {
    const hsm: Hsm = getHsmById(state, hsmId);
    if (hsm.type === 'VideoOrImages') {
      const mediaHState: MediaHState = getHStateByMediaStateId(state, hsm.id, mediaStateId) as MediaHState;
      console.log(mediaHState);
      const data: MediaHStateData = mediaHState.data;
      const mediaStateData = data.mediaStateData!;
      console.log(mediaStateData);
      debugger;
    }
  }

  debugger;

  return '';
}
