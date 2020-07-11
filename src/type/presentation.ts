import { PpSchedule } from './schedule';
import { SyncSpecFileMap } from './playbackEngine';

export interface PresentationDataState {
  platform: string;
  srcDirectory: string;
  syncSpecFileMap: SyncSpecFileMap | null;
  autoSchedule: PpSchedule | null;
}
