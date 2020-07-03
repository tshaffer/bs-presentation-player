import { Mode, SetModeResult } from '@brightsign/videomodeconfiguration';

let writeableConfig = {
  modeName: '',
  colorSpace: '',
  colorDepth: '',
  frequency: 0,
  dropFrame: false,
  width: 1920,
  height: 1080,
  graphicsPlaneWidth: 1920,
  graphicsPlaneHeight: 1080,
  preferred: false,
  interlaced: false,
  overscan: false,
};

export default class VideoMode {

  getAvailableModes(): Promise<Mode[]> {
    return Promise.resolve([]);
  }

  getBestMode(connector: string): Promise<string> {
    return Promise.resolve('');
  }

  getActiveMode(): Promise<Mode> {
    return Promise.resolve({
      modeName: '',
      colorSpace: '',
      colorDepth: '',
      frequency: 0,
      dropFrame: false,
      width: 1920,
      height: 1080,
      graphicsPlaneWidth: 1920,
      graphicsPlaneHeight: 1080,
      preferred: false,
      interlaced: false,
      overscan: false,
    });
  }

  getConfiguredMode(): Promise<Mode> {
    return Promise.resolve(writeableConfig);
  }

  setMode(mode: Mode): Promise<SetModeResult> {
    writeableConfig = mode;
    return Promise.resolve({ restartRequired: false });
  }
}