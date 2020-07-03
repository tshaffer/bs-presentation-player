import {
  VideoInputConfig,
  HdmiInputStatus,
  Status,
} from '@brightsign/videoinput';

const readableConfig =  {
  enableAc3: false,
  enableEac3: false,
  enableTrueHdMlp: false,
  enableDts: false,
  enableDtsHd: false,
  maxSampleRate: 0,
  maxChannelCount: 0,
  lockAudioTo: '',
};

let writeableConfig = {
  enableAc3: false,
  enableEac3: false,
  enableTrueHdMlp: false,
  enableDts: false,
  enableDtsHd: false,
  maxSampleRate: 0,
  maxChannelCount: 0,
  lockAudioTo: '',
};

export default class VideoInput {
  hdmiinputchanged: Event;

  defaultConfig(): VideoInputConfig {
    return readableConfig;
  }

  getConfig(): Promise<VideoInputConfig> {
    return Promise.resolve(writeableConfig);
  }

  applyConfig(config: VideoInputConfig): Promise<Status> {
    writeableConfig = config;
    return Promise.resolve({ rebootRequired: false });
  }

  getStatus(): Promise<HdmiInputStatus> {
    return Promise.resolve({
      devicePresent: false,
      width: 1920,
      height: 1080,
      interlaced: false,
      frameRate: 30,
      pixelClock: 0,
      colorSpace: '',
      audioType: '',
      audioSamplingRate: 0,
    });
  }
}