export default class PointerCalibration {

  startCalibration(): Promise<void> {
    return Promise.resolve();
  }

  getCalibrationStatus(): Promise<number> {
    return Promise.resolve(0);
  }

  setCalibrationRanges(xMin: number, xMax: number, yMin: number, yMax: number): Promise<void> {
    return Promise.resolve();
  }

  clearStoredCalibration(): Promise<boolean> {
    return Promise.resolve(true);
  }

  isCalibrated(): Promise<boolean> {
    return Promise.resolve(true);
  }

  getDiagnosticInfoHTML(deviceInfo: boolean, events: boolean): Promise<string> {
    return Promise.resolve('');
  }

  startEventLogging(): Promise<void> {
    return Promise.resolve();
  }

  stopEventLogging(): Promise<void> {
    return Promise.resolve();
  }

}