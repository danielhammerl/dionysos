export type NodeType =
  | "PROGRAM"
  | "VARIABLE_DECLARATION"
  | "NUMERIC_LITERAL"
  | "IDENTIFIER"
  | "BINARY_EXPRESSION"
  | "VARIABLE_ASSIGNMENT"
  | "FUNCTION_DEFINITION";

/*
 Difference between Statement and Expression: Statements do something, expressions are evaluated into a value
 */

export interface Statement {
  type: NodeType;
}
export interface Expression extends Statement {}

export interface Program extends Statement {
  type: "PROGRAM";
  body: Statement[];
}

/**
 * Binary Expression is an expression with one operator and two arguments, a left side and a right side argument
 * e.g. a == b, a + b, a - b
 */
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

export interface VariableDeclaration extends Statement {
  type: "VARIABLE_DECLARATION";
  identifier: string;
  dataType: string;
  value?: Expression;
}

export interface VariableAssignment extends Expression {
  type: "VARIABLE_ASSIGNMENT";
  identifier: string;
  value: Expression;
}

export interface FunctionDefinition {
  type: "FUNCTION_DEFINITION";
  identifier: string;
  // parameters: VariableDeclaration[]; ??
  body: Statement[];
}
