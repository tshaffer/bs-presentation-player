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

// export type MediaHStateParamsData = (MediaHStateCustomData & MediaHStateTimerData) | null;
export type MediaHStateParamsData = MediaHStateCustomData;

export type MediaHStateCustomData = ImageStateData | VideoStateData | SuperStateData | MrssStateData;

// export interface MediaHStateTimerData {
//   timeoutId?: number;
// }

export interface ImageStateData {
  timeoutId?: number;
}

export interface VideoStateData {
  timeoutId?: number;
}

export interface SuperStateData {
  timeoutId?: number;
}

export interface MrssStateData {
  timeoutId?: number;
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
