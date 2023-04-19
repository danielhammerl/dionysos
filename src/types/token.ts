export type TokenType =
  | "T_EOI" // ;
  | "T_EOF" // eof
  | "T_NUMERIC_LITERAL" // number
  | "T_IDENTIFIER" // string
  | "T_DATA_TYPE" // data type
  | "T_ASSIGN" // =
  | "T_CMP_EQUALS" // ==
  | "T_PLUS" // +
  | "T_MINUS" // -
  | "T_COMMA" // ,
  | "T_ASTERISK" // *
  | "T_PARENTHESIS_OPEN" // (
  | "T_PARENTHESIS_CLOSE" // )
  | "T_BRACES_OPEN" // {
  | "T_BRACES_CLOSE"; // }

export interface Token {
  type: TokenType;
  value: string;
}
