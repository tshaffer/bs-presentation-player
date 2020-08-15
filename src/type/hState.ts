export class HStateType {
  static Top = 'Top';
  static Player = 'Player';
  static Playing = 'Playing';
  static Waiting = 'Waiting';
  static Image = 'Image';
  static Mrss = 'Mrss';
  static Video = 'Video';
  static SuperState = 'SuperState';
}
Object.freeze(HStateType);

export interface HState {
  id: string;
  type: HStateType;
  hsmId: string;
  superStateId: string;
  name: string;
}

export interface MediaHState extends HState {
  data: MediaHStateData;
}

export interface MediaHStateData {
  mediaStateId: string;
  mediaStateData?: MediaHStateParamsData | null;
}

export type MediaHStateParamsData = MediaHStateCustomData & MediaHStateTimerData;

export type MediaHStateCustomData = MrssStateData;

export interface MediaHStateTimerData {
  timeoutId?: number;
}

export interface MrssStateData {
  dataFeedId: string;
  currentFeedId: string | null;
  pendingFeedId: string | null;
  displayIndex: number;
  firstItemDisplayed: boolean;
  waitForContentTimer: any;
}

export interface HStateSpecification {
  type: HStateType;
  hsmId: string;
  superStateId: string;
  name: string;
}

export interface HSMStateData {
  nextStateId: string | null;
}
