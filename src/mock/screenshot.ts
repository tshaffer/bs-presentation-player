import { ScreenshotParams } from '@brightsign/screenshot';

export default class Screenshot {

  syncCapture(params: ScreenshotParams): void {
    return;
  }
  asyncCapture(params: ScreenshotParams): Promise<void> {
    return Promise.resolve();
  }
}