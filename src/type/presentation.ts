import { PpSchedule } from './schedule';

export class RuntimeEnvironment {
  static BrightSign = 'BrightSign';
  static BaconPreview = 'BaconPreview';
  static Dev = 'Dev';
}
Object.freeze(RuntimeEnvironment);

export interface PresentationDataState {
  runtimeEnvironment: RuntimeEnvironment;
  srcDirectory: string;
  syncSpecFileMap: SyncSpecFileMap | null;
  autoSchedule: PpSchedule | null;
}

export interface SyncSpecFileMap {
  [name: string]: SyncSpecDownload;
}

export interface SyncSpecDownload {
  name: string;
  hash: SyncSpecHash;
  size: number;
  link: string;
}

interface SyncSpecHash {
  method: string;
  hex: string;
}

interface SyncSpecMeta {
  client: any;
  server: any;
}

export interface RawSyncSpecFiles {
  download: SyncSpecDownload[];
  ignore: any;
  delete: any;
}

export interface RawSyncSpec {
  meta: SyncSpecMeta;
  files: RawSyncSpecFiles;
}
