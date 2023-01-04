export type TokenType =
  | "T_EOI"
  | "T_EOF"
  | "T_NUMERIC_LITERAL"
  | "T_IDENTIFIER"
  | "T_DATA_TYPE"
  | "T_EQUALS"
  | "T_PLUS"
  | "T_MINUS"
  | "T_PARENTHESIS_OPEN"
  | "T_PARENTHESIS_CLOSE";

export interface Token {
  type: TokenType;
  value: string;
}
