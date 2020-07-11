import { HState } from './hState';
import { DmState } from '@brightsign/bsdatamodel';

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

export interface FileLUT { [fileName: string]: string; }

export interface SubscribedEvents { [eventKey: string]: HState; }

export interface ArState {
  bsdm?: DmState;
  hsm?: any;
  stateName?: string;
}
