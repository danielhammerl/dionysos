export type TokenType =
  | "T_EOI" // ;
  | "T_EOF" // eof
  | "T_NUMERIC_LITERAL"  // number
  | "T_IDENTIFIER" // string
  | "T_DATA_TYPE" // data type
  | "T_ASSIGN" // =
  | "T_CMP_EQUALS" // ==
  | "T_PLUS" // +
  | "T_MINUS" // -
  | "T_PARENTHESIS_OPEN" // (
  | "T_PARENTHESIS_CLOSE"; // )

export interface Token {
  type: TokenType;
  value: string;
}
