export type NodeType = "PROGRAM" | "NUMERIC_LITERAL" | "IDENTIFIER" | "BINARY_EXPRESSION";

export interface Statement {
  type: NodeType;
}

export interface Program extends Statement {
  type: "PROGRAM";
  body: Statement[];
}

export interface Expression extends Statement {}

export interface BinaryExpression extends Expression {
  type: "BINARY_EXPRESSION";
  left: Expression;
  right: Expression;
  operator: string;
}

export interface Identifier extends Expression {
  type: "IDENTIFIER";
  symbol: string;
}

export interface NumericLiteral extends Expression {
  type: "NUMERIC_LITERAL";
  value: BigInt;
}
