export default class Keyboard {

  isAttached(): Promise<boolean> {
    return Promise.resolve(false);
  }
  setLayout(layoutName: string): Promise<void> {
    return Promise.resolve();
  }
}