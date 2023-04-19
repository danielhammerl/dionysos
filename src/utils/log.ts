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
  E_UNDEFINED,
  E_IDENTIFIER_IN_USE,
}

export enum CompilationStep {
  PREPROCESSING = "PREPROCESSING",
  LEXING = "LEXING",
  PARSING = "PARSING",
  COMPILING = "COMPILING",
}

const levelStringMap: Record<ErrorLevel, string> = {
  [ErrorLevel.INTERNAL]: "INTERNAL",
  [ErrorLevel.ERROR]: "ERROR",
  [ErrorLevel.WARNING]: "WARNING",
  [ErrorLevel.INFO]: "INFO",
  [ErrorLevel.DEBUG]: "DEBUG",
};

class CustomError extends Error {
  type: ErrorType;
  level: ErrorLevel;
  step: CompilationStep;
  constructor(message: string, type: ErrorType, step: CompilationStep, level: ErrorLevel) {
    super(message);

    this.type = type;
    this.level = level;
    this.step = step;
  }
}

function log(
  message: string,
  type: ErrorType,
  step: CompilationStep,
  level: ErrorLevel.INTERNAL
): never;
function log(
  message: string,
  type: ErrorType,
  step: CompilationStep,
  level: ErrorLevel.ERROR
): never;
function log(message: string, type: ErrorType, step: CompilationStep, level: ErrorLevel): void;
function log(message: string, type: ErrorType, step: CompilationStep, level: ErrorLevel): void {
  const levelToString = levelStringMap[level];
  console.log("[" + step + "] " + levelToString + ": " + message + " (E" + type + ")");

  if (level < ErrorLevel.WARNING) {
    throw new CustomError(message, type, step, level);
  }
}

export { log };
