export class HStateType {
  static Top = 'Top';
  static Player = 'Player';
  static Playing = 'Playing';
  static Waiting = 'Waiting';
  static Image = 'Image';
}
Object.freeze(HStateType);

export interface HState {
  id: string;
  type: HStateType;
  hsmId: string;
  superStateId: string;
  hStateData?: HStateData;
}

export interface MediaHState extends HState {
  mediaStateId: string;
}

export type HStateData = PlayerHStateData | MediaHStateData;

export interface PlayerHStateData {
  name: string;
}

export interface MediaHStateData {
  mediaStateId: string;
  timeout?: any;
}

export interface HSMStateData {
  nextStateId: string | null;
}
