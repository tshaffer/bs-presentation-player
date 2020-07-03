import { HostConfig, HostWriteableConfig } from '@brightsign/hostconfiguration';

const readableConfig =  {
  loginPassword: true,
  obfuscatedLoginPassword: true,
  proxy: '',
  translatedProxy: '',
  proxyBypassList: [],
  timeServerList: ['http://time.brightsignnetwork.com'],
  timeServerInterval: 0,
  hostName: 'myplayer'
};

// let writeableConfig = {
//   loginPassword: '',
//   obfuscatedLoginPassword: '',
//   proxy: '',
//   translatedProxy: '',
//   proxyBypassList: [] as string[],
//   timeServerList: ['http://time.brightsignnetwork.com'],
//   timeServerInterval: 0,
//   hostName: 'myplayer'
// };

export default class HostConfiguration {

  defaultConfig(): HostConfig {
    return readableConfig;
  }

  getConfig(): Promise<HostConfig> {
    return Promise.resolve(readableConfig);
  }

  applyConfig(config: HostWriteableConfig) {
    // writeableConfig = config;
    return Promise.resolve();
  }
}
