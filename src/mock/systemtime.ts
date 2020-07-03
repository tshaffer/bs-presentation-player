import { LastNetworkTimeResult } from '@brightsign/systemtime';

// let writeableDate = new Date();
export default class SystemTime {

  networktimeevent: Event;

  setDate(date: Date): Promise<void> {
    // writeableDate = date;
    return Promise.resolve();
  }

  setTimeZone(timezoneString: string): Promise<void> {
    return Promise.resolve();
  }

  lastNetworkTimeResult(): LastNetworkTimeResult {
    return {
      successTimestamp: 0,
      attemptTimestamp: 0,
      failureReason: '',
    };
  }
}