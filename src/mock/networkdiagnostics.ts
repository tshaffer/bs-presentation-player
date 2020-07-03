import { InterfaceTestResult } from '@brightsign/networkdiagnostics';

export default class NetworkDiagnostics {

  testInternetConnectivity(): Promise<InterfaceTestResult> {
    return Promise.resolve({
      diagnosis: '',
      ok: true,
      log: []
    });
  }

  testNetworkInterface(interfaceName: string): Promise<InterfaceTestResult> {
    return Promise.resolve({
      diagnosis: '',
      ok: true,
      log: []
    });
  }
}