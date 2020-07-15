import { createHsm } from './hsm';
import { createHState } from './hState';
import {
  HState,
  HStateType,
  HsmProperties,
  HsmType,
  BsPpState,
} from '../../type';
import {
  BsPpStringThunkAction, BsPpDispatch,
} from '../../model';

import { getHStateByName } from '../../selector/hsm';
import { isNil } from 'lodash';
import { setHsmTop } from '../../model';

export const createZoneHsm = (
  hsmName: string,
  hsmType: HsmType,
  hsmData: HsmProperties
): BsPpStringThunkAction => {
  return ((dispatch: BsPpDispatch, getState: () => BsPpState) => {
    const hsmId: string = dispatch(createHsm(hsmName, hsmType, hsmData));

    dispatch(createHState(HStateType.Top, hsmId, '', 'top'));
    const stTop: HState | null = getHStateByName(getState(), 'top');
    const stTopId: string = isNil(stTop) ? '' : stTop.id;

    dispatch(setHsmTop(hsmId, stTopId));

    return hsmId;
  });
};
