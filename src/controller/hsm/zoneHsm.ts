import { createHsm } from './hsm';
import { createHState } from './hState';
import {
  HState,
  HStateType,
  HsmData,
} from '../../type';
import {
  BsPpStringThunkAction,
} from '../../model';

import { getHStateByName } from '../../selector/hsm';
import { isNil } from 'lodash';
import { setHsmTop } from '../../model';

export const createZoneHsm = (
  hsmName: string,
  hsmType: string,
  hsmData: HsmData
): BsPpStringThunkAction => {
  return ((dispatch: any, getState: any) => {
    console.log('invoke createZoneHsm');
    const hsmId: string = dispatch(createHsm(hsmName, hsmType, hsmData));

    dispatch(createHState(HStateType.Top, hsmId, '', {
      name: 'top',
    }));
    const stTop: HState | null = getHStateByName(getState(), 'top');
    const stTopId: string = isNil(stTop) ? '' : stTop.id;

    dispatch(setHsmTop(hsmId, stTopId));

    return hsmId;
  });
};
