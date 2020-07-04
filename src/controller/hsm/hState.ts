import { HState, HStateData } from '../../type/hsm';
import { addHState } from '../../model';
import { newBsPpId } from '../../utility';
import {
  BsPpDispatch,
  BsPpStringThunkAction,
} from '../../model';

export const ppCreateHState = (
  type: string,
  hsmId: string,
  superStateId: string,
  hStateData?: HStateData,
): BsPpStringThunkAction => {
  return ((dispatch: BsPpDispatch) => {
    const id: string = newBsPpId();
    const hState: HState = {
      id,
      type,
      hsmId,
      superStateId,
      hStateData,
    };
    dispatch(addHState(hState));
    return id;
  });
};
