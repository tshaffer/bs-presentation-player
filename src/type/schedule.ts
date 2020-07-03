import { BsAssetLocator } from '@brightsign/bscore';

// export type PpSchedule = ScheduledPresentation[];

export interface PpSchedule {
  scheduledPresentations: ScheduledPresentation[];
}

export interface ScheduledPresentation {
  presentationToSchedule: ScheduledPresentationFileData;
  presentationLocator: BsAssetLocator;    // BsAssetLocator for presentation
  dateTime: string;                       // date/time of event start: 2017-02-23T08:00:00
  duration: number;                       // duration in minutes
  allDayEveryDay: boolean;                //
  recurrence: boolean;                    //
  recurrencePattern: string;              // Daily or Weekly
  recurrencePatternDaily: string;         // EveryDay, EveryWeekday, EveryWeekend
  recurrencePatternDaysOfWeek: number;    // bitmask indicating days of week when recurrencePattern is weekly
  // Sunday=1, Monday=2, Tuesday=4, etc.
  recurrenceStartDate: string;            // midnight of day recurring event starts: 2017-02-20T00:00:00
  recurrenceGoesForever: boolean;         //
  recurrenceEndDate: string;              // midnight of day recurring event ends
  interruption: boolean;
}

export interface ScheduledPresentationFileData {
  name: string;
  fileName: string;
  filePath: string;
}
