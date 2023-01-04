import { dataTypeList } from "./internalDataTypes";

export type NodeType =
  | "PROGRAM"
  | "VARIABLE_DECLARATION"
  | "NUMERIC_LITERAL"
  | "IDENTIFIER"
  | "BINARY_EXPRESSION"
  | "VARIABLE_ASSIGNMENT";

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
