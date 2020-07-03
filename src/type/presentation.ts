import { ArSyncSpec } from './playbackEngine';
import { PpSchedule } from './schedule';

export interface PresentationDataState {
  platform: string;
  srcDirectory: string;
  syncSpec: ArSyncSpec | null;
  autoSchedule: PpSchedule | null;
}
