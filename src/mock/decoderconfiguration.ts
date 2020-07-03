import { DecoderConfig } from '@brightsign/decoderconfiguration';

export default class DecoderConfiguration {

  getConfig(): Promise<DecoderConfig[]> {
    return Promise.resolve([]);
  }

  applyConfig(config: DecoderConfig[]): Promise<void> {
    return Promise.resolve();
  }
}