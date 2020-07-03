import { ClientCertificateObject, Package } from '@brightsign/keystore';

export default class KeyStore {

  addCaCertificate(filename: string): Promise<void> {
    return Promise.resolve();
  }

  addCaPackage(filename: string): Promise<void> {
    return Promise.resolve();
  }

  addClientCertificate(object: ClientCertificateObject): Promise<void> {
    return Promise.resolve();
  }

  removeCaPackage(filename: string): Promise<void> {
    return Promise.resolve();
  }

  getCaPackagesInstalled(): Promise<Package[]> {
    return Promise.resolve([]);
  }
}