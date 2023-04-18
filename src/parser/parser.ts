import {
  BinaryExpression,
  Expression,
  IdentifierExpression,
  NumericLiteralExpression,
  Program,
  Statement,
  VariableAssignmentExpression,
  VariableDefinitionStatement,
} from "../types/ast";
import { Token } from "../types/token";
import { ErrorLevel, ErrorType, log } from "../utils/log";
import { DataType } from "../constants/dataTypes";

const tokensToParse: Token[] = [];
const _statements: Statement[] = [];
//const _functions: FunctionDefinition[] = [];
const getCurrentToken = (): Token => {
  return tokensToParse[0];
};

const getCurrentTokenAndRemoveFromList = (): Token => {
  return tokensToParse.shift()!;
};

const addStatement = (statement: Statement) => {
  _statements.push(statement);
};

export const parse = (input: Token[]): Program => {
  input.forEach((item) => tokensToParse.push(item));

  while (getCurrentToken().type !== "T_EOF") {
    if (getCurrentToken().type === "T_EOI") {
      getCurrentTokenAndRemoveFromList();
    } else {
      parseStatement();
    }
  }

  return {
    type: "PROGRAM",
    body: _statements,
  };
};

const parseStatement = (): void => {
  const token = getCurrentToken();
  switch (token.type) {
    case "T_DATA_TYPE": {
      // here we have to add function definitions
      const dataType = getCurrentTokenAndRemoveFromList().value as DataType;
      const identifier: IdentifierExpression = {
        statementType: "EXPRESSION_STATEMENT",
        expressionType: "IDENTIFIER_LITERAL_EXPRESSION",
        symbol: getCurrentTokenAndRemoveFromList().value,
      };

      const nextToken = getCurrentTokenAndRemoveFromList();
      if (nextToken.type === "T_PARENTHESIS_OPEN") {
        // function
        break;
      } else if (nextToken.type === "T_ASSIGN") {
        // variable
        if (dataType === "uint16") {
          const statement: VariableDefinitionStatement = {
            statementType: "VARIABLE_DEFINITION_STATEMENT",
            identifier: identifier,
            dataType: dataType,
            value: parseExpression(),
          };

          addStatement(statement);
          break;
        } else {
          log(
            "Unexpected datatype for variable declaration: " + dataType,
            ErrorType.E_SYNTAX,
            ErrorLevel.ERROR
          );
          break;
        }
      } else {
        log(
          "Expected T_ASSIGN or T_PARENTHESIS_OPEN after variable declaration, got " +
            nextToken.type,
          ErrorType.E_SYNTAX,
          ErrorLevel.ERROR
        );
        break;
      }
    }
    default: {
      addStatement(parseExpression());
    }
  }
};

/**
 * expression order of execution from high to low
 * 1. primary expressions, e.g. expressions in parentheses, literal expressions, identifier expressions
 * 2. binary expressions
 *   a. multiplicative expressions
 *   b. additive expressions
 *   c. logical expressions
 */
const parseExpression = (): Expression => {
  return parseLogicalExpression();
};

const parseLogicalExpression = (): Expression => {
  let left: Expression = parseAdditiveExpression();

  while (getCurrentToken().type === "T_CMP_EQUALS") {
    getCurrentTokenAndRemoveFromList();
    const right = parseAdditiveExpression();

    left = {
      statementType: "EXPRESSION_STATEMENT",
      expressionType: "BINARY_EXPRESSION",
      left,
      right: right,
      operator: "==",
    } as BinaryExpression;
  }

  return left;
};

const parseAdditiveExpression = (): Expression => {
  let left: Expression = parseMultiplicativeExpression();
  while (getCurrentToken().type === "T_PLUS" || getCurrentToken().type == "T_MINUS") {
    const operator = getCurrentTokenAndRemoveFromList().value;
    const right = parseMultiplicativeExpression();

    left = {
      statementType: "EXPRESSION_STATEMENT",
      expressionType: "BINARY_EXPRESSION",
      left,
      right,
      operator,
    } as BinaryExpression;
  }
  return left;
};

const parseMultiplicativeExpression = (): Expression => {
  // no multiplication for now!
  return parsePrimaryExpression();
};

const parsePrimaryExpression = ():
  | Expression
  | VariableAssignmentExpression
  | IdentifierExpression
  | NumericLiteralExpression => {
  const token = getCurrentToken();
  switch (token.type) {
    case "T_IDENTIFIER": {
      const identifier: IdentifierExpression = {
        statementType: "EXPRESSION_STATEMENT",
        expressionType: "IDENTIFIER_LITERAL_EXPRESSION",
        symbol: getCurrentTokenAndRemoveFromList().value,
      };
      const nextToken = getCurrentToken();

      if (nextToken.type === "T_ASSIGN") {
        getCurrentTokenAndRemoveFromList();
        return {
          statementType: "EXPRESSION_STATEMENT",
          expressionType: "VARIABLE_ASSIGNMENT_EXPRESSION",
          identifier: identifier,
          value: parseExpression(),
        };
      }

      return identifier;
    }

    case "T_NUMERIC_LITERAL": {
      return {
        statementType: "EXPRESSION_STATEMENT",
        expressionType: "NUMBER_LITERAL_EXPRESSION",
        value: BigInt(getCurrentTokenAndRemoveFromList().value),
      };
    }

    case "T_PARENTHESIS_OPEN": {
      getCurrentTokenAndRemoveFromList();
      const value = parseExpression();
      const token = getCurrentTokenAndRemoveFromList();
      if (token.type !== "T_PARENTHESIS_CLOSE") {
        return log(
          "Expected closing parenthesis, got: " + token.type,
          ErrorType.E_SYNTAX,
          ErrorLevel.ERROR
        );
      }

      return value;
    }

    default: {
      return log(
        "Unimplemented token in parser: " + token.value,
        ErrorType.E_NOT_IMPLEMENTED,
        ErrorLevel.INTERNAL
      );
    }
  }
};
