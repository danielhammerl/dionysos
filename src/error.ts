export enum ErrorLevel {
  INTERNAL = 0,
  ERROR = 100,
  WARNING = 200,
  INFO = 300,
  DEBUG = 400,
}

export enum ErrorType {
  E_UNRECOGNIZED_TOKEN,
  E_SYNTAX,
  E_NOT_IMPLEMENTED,
}

const levelStringMap: Record<ErrorLevel, string> = {
  [ErrorLevel.INTERNAL]: "INTERNAL",
  [ErrorLevel.ERROR]: "ERROR",
  [ErrorLevel.WARNING]: "WARNING",
  [ErrorLevel.INFO]: "INFO",
  [ErrorLevel.DEBUG]: "DEBUG",
};

function log(message: string, type: ErrorType, level: ErrorLevel.INTERNAL): never;
function log(message: string, type: ErrorType, level: ErrorLevel.ERROR): never;
function log(message: string, type: ErrorType, level: ErrorLevel): void;
function log(message: string, type: ErrorType, level: ErrorLevel): void {
  const levelToString = levelStringMap[level];
  console.log(levelToString + ": " + message + " (E" + type + ")");

  if (level < ErrorLevel.WARNING) {
    process.exit(1);
  }
}

export { log };
