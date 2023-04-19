import { DataType } from "../constants/dataTypes";

export type StatementType =
  | "VARIABLE_DEFINITION_STATEMENT"
  | "FUNCTION_DEFINITION_STATEMENT"
  | "EXPRESSION_STATEMENT"
  | "NOOP_STATEMENT";
export type ExpressionType =
  | "STRING_LITERAL_EXPRESSION" // not yet implemented
  | "NUMBER_LITERAL_EXPRESSION"
  | "IDENTIFIER_LITERAL_EXPRESSION"
  | "VARIABLE_ASSIGNMENT_EXPRESSION"
  | "BINARY_EXPRESSION"
  | "NOOP_EXPRESSION";

/*
 Difference between Statement and Expression: Statements do something, expressions are evaluated into a value
 statements are for example if, while, variable declarations, function declarations
 expressions are for example 4+8, a() || b(), y = (4*4+getNumber()) - 1
 */

export type Statement<T extends StatementType = StatementType> = {
  statementType: T;
};

export type Expression<T extends ExpressionType = ExpressionType> =
  Statement<"EXPRESSION_STATEMENT"> & {
    expressionType: T;
  };

export type Program = {
  type: "PROGRAM";
  body: Statement[];
};

export type BinaryExpressionOperator = string; // TODO specify this
export type NoopStatement = Statement<"NOOP_STATEMENT"> & {};
export type NoopExpression = Expression<"NOOP_EXPRESSION">;

/**
 * Binary Expression is an expression with one operator and two arguments, a left side and a right side argument
 * e.g. a == b, a + b, a - b
 */
export type BinaryExpression = Expression<"BINARY_EXPRESSION"> & {
  left: Expression;
  right: Expression;
  operator: BinaryExpressionOperator;
};

export type IdentifierExpression = Expression<"IDENTIFIER_LITERAL_EXPRESSION"> & {
  symbol: string;
};

export type NumericLiteralExpression = Expression<"NUMBER_LITERAL_EXPRESSION"> & {
  value: BigInt;
};

export type VariableDefinitionStatement = Statement<"VARIABLE_DEFINITION_STATEMENT"> & {
  identifier: IdentifierExpression;
  value: Expression;
  dataType: DataType;
};

export type VariableAssignmentExpression = Expression<"VARIABLE_ASSIGNMENT_EXPRESSION"> & {
  identifier: IdentifierExpression;
  value: Expression;
};

export type FunctionDefinitionStatement = Statement<"FUNCTION_DEFINITION_STATEMENT"> & {
  identifier: IdentifierExpression;
  // parameters: VariableDeclaration[]; ??
  body: Statement[];
};
