import { Token, TokenType } from "./types/token";
import { isAlphaNumeric, isNumeric } from "./util";

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
        tokens.push({ type: "DATA_TYPE", value: multiCharString });
      } else if (isNumeric(multiCharString)) {
        tokens.push({ type: "NUMERIC_LITERAL", value: multiCharString });
      } else {
        tokens.push({ type: "IDENTIFIER", value: multiCharString });
      }
    } else {
      console.error("Unrecognized token: " + char);
      process.exit(1);
    }
  }

  return tokens;
};

const charTokenMap: Partial<Record<string, TokenType>> = {
  "=": "EQUALS",
  ";": "EOI",
  "+": "PLUS",
  "-": "MINUS",
  "(": "PARENTHESIS_OPEN",
  ")": "PARENTHESIS_CLOSE",
};

const dataTypeList: string[] = ["uint8", "uint16"];

const isIgnorable = (input: string) => {
  return input === " " || input === "\n" || input === "\r" || input === "\t" || input === "\r\n";
};
