import { Token, TokenType } from "../types/token";
import { isAlphaNumeric, isNumeric } from "../utils/util";
import { CompilationStep, ErrorLevel, ErrorType, log } from "../utils/log";
import { dataTypeList } from "../constants/dataTypes";

export const lexicate = (input: string): Token[] => {
  const src = input.split("");
  const tokens: Token[] = [];

  while (src.length > 0) {
    const char = src.shift()!;

    if (isIgnorable(char)) {
    } else if (
      multiCharTokenMap?.[`${char}${src[0]}${src[1]}`] ||
      multiCharTokenMap?.[`${char}${src[0]}`]
    ) {
      const matchLength = multiCharTokenMap?.[`${char}${src[0]}${src[1]}`] ? 3 : 2;
      const token =
        multiCharTokenMap?.[`${char}${src[0]}${src[1]}`] || multiCharTokenMap?.[`${char}${src[0]}`];

      tokens.push({ type: token!, value: char + src.splice(0, matchLength - 1).join("") });
    } else if (charTokenMap[char]) {
      tokens.push({ type: charTokenMap[char]!, value: char });
    } else if (isAlphaNumeric(char)) {
      // multi char token types

      let multiCharString = char;

      while (src.length > 0 && isAlphaNumeric(src[0])) {
        multiCharString += src.shift();
      }

      if ((dataTypeList as unknown as string).includes(multiCharString)) {
        tokens.push({ type: "T_DATA_TYPE", value: multiCharString });
      } else if (isNumeric(multiCharString)) {
        tokens.push({ type: "T_NUMERIC_LITERAL", value: multiCharString });
      } else {
        tokens.push({ type: "T_IDENTIFIER", value: multiCharString });
      }
    } else {
      return log(
        "Unrecognized Token: " + char,
        ErrorType.E_UNRECOGNIZED_TOKEN,
        CompilationStep.LEXING,
        ErrorLevel.ERROR
      );
    }
  }

  tokens.push({ type: "T_EOF", value: "T_EOF" });
  return tokens;
};

const multiCharTokenMap: Partial<Record<string, TokenType>> = {
  "==": "T_CMP_EQUALS",
};

const charTokenMap: Partial<Record<string, TokenType>> = {
  "=": "T_ASSIGN",
  ";": "T_EOI",
  "+": "T_PLUS",
  "-": "T_MINUS",
  "(": "T_PARENTHESIS_OPEN",
  ")": "T_PARENTHESIS_CLOSE",
  ",": "T_COMMA",
  "*": "T_ASTERISK",
  "{": "T_BRACES_OPEN",
  "}": "T_BRACES_CLOSE",
};

const isIgnorable = (input: string) => {
  return input === " " || input === "\n" || input === "\r" || input === "\t" || input === "\r\n";
};
