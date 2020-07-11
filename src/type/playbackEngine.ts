import { HState } from './hState';
import { DmState } from '@brightsign/bsdatamodel';

export interface ArSyncSpecHash {
  method: string;
  hex: string;
}

export interface ArSyncSpecDownload {
  name: string;
  hash: ArSyncSpecHash;
  size: number;
  link: string;
}

export interface ArSyncSpecMeta {
  client: any;
  server: any;
}

export interface ArRawSyncSpecFiles {
  download: ArSyncSpecDownload[];
  ignore: any;
  delete: any;
}

export interface ArRawSyncSpec {
  meta: ArSyncSpecMeta;
  files: ArRawSyncSpecFiles;
}

export interface ArFileLUT { [fileName: string]: string; }

export interface SubscribedEvents { [eventKey: string]: HState; }

export interface ArState {
  bsdm?: DmState;
  hsm?: any;
  stateName?: string;
}

export interface SyncSpecFileMap {
  [name: string]: ArSyncSpecDownload;
}
