import {
  DWSConfig,
  DWSConfigWritable,
  DWSResult,
} from '@brightsign/dwsconfiguration';

const readableConfig =  {
  port: 0,
  password: {
    value: '',
    obfuscated: false,
  },
  authenticationList: [],
};

// let writeableConfig = {
//   password: {
//     value: '',
//     obfuscated: false,
//   },
// };

export default class DWSConfiguration {
  defaultConfig(): DWSConfig {
    return readableConfig;
  }
  getConfig(): Promise<DWSConfig> {
    return Promise.resolve(readableConfig);
  }
  applyConfig(config: DWSConfigWritable): Promise<DWSResult> {
    // writeableConfig = config;
    return Promise.resolve({ restartRequired: true });
  }
}