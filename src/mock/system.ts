import { Size } from '@brightsign/system';

export default class System {

  reboot(): void {
    return;
  }

  setImageSizeThreshold(size: Size): Promise<void> {
    return Promise.resolve();
  }
}