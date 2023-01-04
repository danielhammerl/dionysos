export type TokenType =
  | "EOI"
  | "NUMERIC_LITERAL"
  | "IDENTIFIER"
  | "DATA_TYPE"
  | "EQUALS"
  | "PLUS"
  | "MINUS"
  | "PARENTHESIS_OPEN"
  | "PARENTHESIS_CLOSE";

export interface Token {
  type: TokenType;
  value: string;
}
