import {
  Size,
  ColorProperties,
  EdidIdentity,
  OutputStatus,
  TxHdcpStatus,
} from '@brightsign/videooutput';

// let writableColorProperties = {
//   constrast: 0,
//   saturation: 0,
//   hue: 0,
//   brightness: 0,
// };

export default class VideoOutput {

  type: string;
  hotplugevent: Event;

  constructor(interfaceName: string) {
    this.type = interfaceName;
    return;
  }

  getVideoResolution(): Promise<Size> {
    return Promise.resolve({ height: 1080, width: 1920 });
  }

  getGraphicsResolution(): Promise<Size> {
    return Promise.resolve({ height: 1080, width: 1920 });
  }

  getOutputResolution(): Promise<Size> {
    return Promise.resolve({ height: 1080, width: 1920 });
  }

  adjustGraphicsColor(colorProperties: ColorProperties): Promise<void> {
    // writableColorProperties = colorProperties;
    return Promise.resolve();
  }

  getEdidIdentity(): Promise<EdidIdentity> {
    return Promise.resolve({
      manufacturer: '',
      product: 0,
      serialNumber: 0,
      weekOfManufacture: 0,
      yearOfManufacture: 0,
      monitorName: '',
      textString: '',
      serialNumberString: '',
      bt2020RgbSupport: false,
      bt2020YccSupport: false,
      sdrEotfSupport: false,
      hdrEotfSupport: false,
      hdrSt2084Support: false,
      unstable: false,
    });
  }

  getEdid(): Promise<string> {
    return Promise.resolve('');
  }

  setMultiScreenBezel(xPercentage: number, yPercentage: number): Promise<void> {
    return Promise.resolve();
  }

  setBackgroundColor(color: number): Promise<void> {
    return Promise.resolve();
  }

  setPowerSaveMode(enable: boolean): Promise<void> {
    return Promise.resolve();
  }

  set3dMode(mode: number): Promise<void> {
    return Promise.resolve();
  }

  setSyncDomain(domain: string): Promise<void> {
    return Promise.resolve();
  }

  isAttached(): Promise<boolean> {
    return Promise.resolve(true);
  }

  getOutputStatus(): Promise<OutputStatus> { // if type === hdmi
    return Promise.resolve({
      outputPresent: false,
      outputPowered: false,
      unstable: false,
      audioFormat: '',
      audioSampleRate: 0,
      audioBitsPerSample: 0,
      audioChannelCount: 0,
      eotf: '',
    });
  }

  disableAudio(disable: boolean): Promise<void> { // if type === hdmi
    return Promise.resolve();
  }

  getTxHdcpStatus(): Promise<TxHdcpStatus> { // if type === hdmi
    return Promise.resolve({ state: '' });
  }

  forceHdcpOn(forceHdcpOn: boolean): Promise<void> { // if type === hdmi
    return Promise.resolve();
  }
}