export class HStateType {
  static Top = 'Top';
  static Player = 'Player';
  static Playing = 'Playing';
  static Waiting = 'Waiting';
  static Image = 'Image';
  static Video = 'Video';
}
Object.freeze(HStateType);

export interface HState {
  id: string;
  type: HStateType;
  hsmId: string;
  superStateId: string;
  name: string;
}

// TEDTODO - duplicate of HStateinterface
export interface HStateSpecification {
  id: string;
  type: HStateType;
  hsmId: string;
  superStateId: string;
  name: string;
}

export interface MediaHState extends HState {
  mediaStateId: string;
  timeoutId?: number;
}

export interface HSMStateData {
  nextStateId: string | null;
}
