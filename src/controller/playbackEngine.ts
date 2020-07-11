import { Store } from 'redux';

import {
  BsPpState,
} from '../type';
import {
  BsPpDispatch,
} from '../model';

import {
  createPlayerHsm,
  initializePlayerHsm,
} from './hsm';

export let _bsPpStore: Store<BsPpState>;

export function initPlayer(store: Store<BsPpState>) {
  _bsPpStore = store;
  return ((dispatch: BsPpDispatch) => {
    // dispatch(launchHSM());
  });
}

export function launchHsm() {
  return ((dispatch: BsPpDispatch) => {
    dispatch(createPlayerHsm());
    dispatch(initializePlayerHsm());
  });
}
