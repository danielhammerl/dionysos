import { Token, TokenType } from "./types/token";
import { isAlphaNumeric, isNumeric } from "./util";
import { ErrorLevel, ErrorType, log } from "./error";

export const lexicate = (input: string): Token[] => {
  const src = input.split("");
  const tokens: Token[] = [];

  while (src.length > 0) {
    const char = src.shift()!;

    const tokenTypeFromMap = charTokenMap[char];
    if (isIgnorable(char)) {
    } else if (tokenTypeFromMap) {
      tokens.push({ type: tokenTypeFromMap, value: char });
    } else if (isAlphaNumeric(char)) {
      // multi char token types

      let multiCharString = char;

      while (src.length > 0 && isAlphaNumeric(src[0])) {
        multiCharString += src.shift();
      }

      if (dataTypeList.includes(multiCharString)) {
        tokens.push({ type: "T_DATA_TYPE", value: multiCharString });
      } else if (isNumeric(multiCharString)) {
        tokens.push({ type: "T_NUMERIC_LITERAL", value: multiCharString });
      } else {
        tokens.push({ type: "T_IDENTIFIER", value: multiCharString });
      }
    } else {
      return log("Unrecognized Token: " + char, ErrorType.E_UNRECOGNIZED_TOKEN, ErrorLevel.ERROR);
    }
  }

  tokens.push({ type: "T_EOF", value: "T_EOF" });
  return tokens;
};

const charTokenMap: Partial<Record<string, TokenType>> = {
  "=": "T_EQUALS",
  ";": "T_EOI",
  "+": "T_PLUS",
  "-": "T_MINUS",
  "(": "T_PARENTHESIS_OPEN",
  ")": "T_PARENTHESIS_CLOSE",
};

const dataTypeList: string[] = ["uint8", "uint16"];

const isIgnorable = (input: string) => {
  return input === " " || input === "\n" || input === "\r" || input === "\t" || input === "\r\n";
};
