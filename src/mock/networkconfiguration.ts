import {
  IPAddress,
  NetworkInterfaceConfig,
  WifiInterfaceConfig,
  ModemInterfaceConfig,
  EthernetInterfaceConfig,
  LLDPNeighborInformation,
  WifiAccessPointList,
} from '@brightsign/networkconfiguration';

const readableBaseConfig =  {
  metric: 0,
  dnsServerList: [] as string[],
  ipAddressList: [] as IPAddress[],
  enabledProtocolList: [] as string[],
  inboundShaperRate: 0,
  mtu: 0,
  clientIdentifier: '',
  domain: '',
};

let writeableBaseConfig = {
  metric: 0,
  dnsServerList: [] as string[],
  ipAddressList: [] as IPAddress[],
  enabledProtocolList: [] as string[],
  inboundShaperRate: 0,
  mtu: 0,
  clientIdentifier: '',
  domain: '',
};

let readableWifiConfig =  {
  ...writeableBaseConfig,
  essId: '',
  passphrase: '',
  obfuscatedPassphrase: '',
  country: '',
  securityMode: '',
  identity: '',
  eapTlsOptions: '',
  caCertificates: '',
  clientCertificate: '',
  privateKey: '',
};

let readableEthernetConfig =  {
  ...writeableBaseConfig,
  securityMode: '',
  identity: '',
  eapTlsOptions: '',
  caCertificates: '',
  clientCertificate: '',
  privateKey: '',
};

let readableModemConfig =  {
  ...writeableBaseConfig,
  user: '',
  password: '',
  number: '',
  initString: '',
};

export default class NetworkConfiguration {

  type: string;

  constructor(type: string) {
    this.type = type;
  }

  defaultConfig(): NetworkInterfaceConfig {
    return readableBaseConfig;
  }

  getConfig(): Promise<WifiInterfaceConfig | ModemInterfaceConfig | EthernetInterfaceConfig> {
    if (this.type === 'ppp0') {
      return Promise.resolve(readableModemConfig);
    } else if (this.type === 'wlan0') {
      return Promise.resolve(readableWifiConfig);
    } else {
      return Promise.resolve(readableEthernetConfig);
    }
  }

  applyConfig(config: NetworkInterfaceConfig): Promise<void> {
    writeableBaseConfig = config;
    if (this.type === 'ppp0') {
      readableModemConfig = {
        ...readableModemConfig,
        ...writeableBaseConfig,
      } as ModemInterfaceConfig;
      return Promise.resolve();
    } else if (this.type === 'wlan0') {
      readableWifiConfig = {
        ...readableWifiConfig,
        ...writeableBaseConfig,
      } as WifiInterfaceConfig;
      return Promise.resolve();
    } else {
      readableEthernetConfig = {
        ...readableEthernetConfig,
        ...writeableBaseConfig,
      } as EthernetInterfaceConfig;
      return Promise.resolve();
    }
  }

  getNeighborInformation(): Promise<LLDPNeighborInformation> { // for NetworkConfigurationType.eth0
    return Promise.resolve({ });
  }

  enableLeds(): Promise<void> { // for NetworkConfigurationType.eth0
    return Promise.resolve();
  }

  scan(): Promise<WifiAccessPointList> { // for NetworkConfigurationType.wlan0
    return Promise.resolve({
      essId: readableWifiConfig.essId,
      bssId: '',
      signal: 0,
    });
  }
}