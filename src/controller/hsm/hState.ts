import { HStateSpecification } from '../../type';
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
