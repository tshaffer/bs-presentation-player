// import log from 'electron-log';
// const log = require('electron-log');
import isomorphicPath from 'isomorphic-path';
import * as fs from 'fs-extra';
import { HState, HsmEventType } from '../type';

let writeStream: fs.WriteStream;

const events: any[] = [];

export function initLogging() {
  const logFilePath = isomorphicPath.join('/Users/tedshaffer/Library/Logs/', 'hsmEventLog.json');
  writeStream = fs.createWriteStream(logFilePath, { flags: 'w' });
}

export function logHsmEvent(
  playerStateBefore: any,
  event: HsmEventType,
  hState: HState,
  playerStateAfter: any,
) {
  const eventDateTime = new Date();
  const eventTime: number = eventDateTime.getTime();

  const eventMsg: any = {};
  eventMsg.time = eventTime;
  eventMsg.event = event;
  eventMsg.hState = hState;
  eventMsg.hsmStateBefore = playerStateBefore;
  eventMsg.hsmStateAfter = playerStateAfter;

  events.push(eventMsg);

  // logMessage(JSON.stringify(eventMsg));

  // TEDTODO - temp test code
  if (events.length === 40) {
    const logMsg: any = {
      events
    };
    logMessage(JSON.stringify(logMsg));
  }
}

function logMessage(message: string) {
  writeStream.write(message);
}
