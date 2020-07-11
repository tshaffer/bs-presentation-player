import { HState } from './hState';
import { DmState } from '@brightsign/bsdatamodel';

export interface SubscribedEvents { [eventKey: string]: HState; }

export interface ArState {
  bsdm?: DmState;
  hsm?: any;
  stateName?: string;
}
