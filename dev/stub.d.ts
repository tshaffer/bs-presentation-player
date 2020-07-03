// @src/types/modules.d.ts
declare module 'redux-test-utils';
declare module 'enzyme-redux';

declare module '@brightsign/hostconfiguration' {
  export interface HostConfig {
    proxy: string;
    translatedProxy: string;
    proxyBypassList: string[];
    timeServerList: string[];
    timeServerInterval: number;
    hostName: string;
  }
  
  export interface HostWriteableConfig {
    loginPassword: string;
    obfuscatedLoginPassword: string;
  }
  
  export function defaultConfig(): HostConfig;
  
  export function getConfig(): Promise<HostConfig>;
  
  export function applyConfig(config: HostWriteableConfig): Promise<void>;
}
