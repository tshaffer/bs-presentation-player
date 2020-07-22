export enum BsPpErrorType {
  unknownError,
  unexpectedError,
  invalidParameters,
  invalidOperation,
  apiError,
  invalidModel,
  invalidRemoteConfigurationFile,
}

const bsPpErrorMessage: {[type: number]: string} = {
  [BsPpErrorType.unknownError]: 'Unknown error',
  [BsPpErrorType.unexpectedError]: 'Unexpected error',
  [BsPpErrorType.invalidParameters]: 'Invalid parameters',
  [BsPpErrorType.invalidOperation]: 'Invalid operation attempt',
  [BsPpErrorType.apiError]: 'API error',
  [BsPpErrorType.invalidModel]: 'Invalid model',
  [BsPpErrorType.invalidRemoteConfigurationFile]: 'Invalid remote configuration file',
};

export class BsPpError extends Error {
  name = 'BsPpError';
  type: BsPpErrorType;

  constructor(type: BsPpErrorType, reason?: string) {
    super();
    this.type = type;
    if (reason) {
      this.message = bsPpErrorMessage[type] + ': ' + reason;
    } else {
      this.message = bsPpErrorMessage[type];
    }
    Object.setPrototypeOf(this, BsPpError.prototype);
  }
}

export function isBsPpError(error: Error): error is BsPpError {
  return error instanceof BsPpError;
}
