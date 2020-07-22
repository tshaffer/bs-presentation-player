import { isNil } from 'lodash';

/** @internal */
/** @private */
export const isMac = (): boolean => {
  return !isNil(navigator.platform) && navigator.platform.toLowerCase().indexOf('mac') > -1;
};

/** @internal */
/** @private */
export const isPc = (): boolean => {
  return !isNil(navigator.platform) && navigator.platform.toLowerCase().indexOf('win') > -1;
};

/** @internal */
/** @private */
export const isDesktop = (): boolean => {
  return process.env.PLATFORM === 'electron';
};

/** @internal */
/** @private */
export const isBrowser = (): boolean => {
  return process.env.PLATFORM === 'browser';
};
