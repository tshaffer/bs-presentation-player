export default class NetworkDiagnostics {

  isMousePresent(): Promise<boolean> {
    return Promise.resolve(false);
  }

  isMultiTouchPresent(): Promise<boolean> {
    return Promise.resolve(false);
  }
}