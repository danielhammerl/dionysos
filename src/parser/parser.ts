import {
  BinaryExpression,
  Expression,
  FunctionDefinition,
  Identifier,
  NumericLiteral,
  Program,
  Statement,
  VariableAssignment,
  VariableDeclaration,
} from "../types/ast";
import { Token } from "../types/token";
import { ErrorLevel, ErrorType, log } from "../utils/log";

let _tokens: Token[] = [];
const _statements: Statement[] = [];
const _functions: FunctionDefinition[] = [];
const getCurrentToken = (): Token => {
  return _tokens[0];
};

const getCurrentTokenAndRemoveFromList = (): Token => {
  return _tokens.shift()!;
};

const addStatement = (statement: Statement) => {
  _statements.push(statement);
};

export const parse = (input: Token[]): Program => {
  _tokens = [...input];

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
      parseVariableDeclaration();
      break;
    }
    default: {
      parseExpression();
      break;
    }
  }
};

const parseExpression = (): Expression => {
  return parseLogicalExpression();
};

const parseLogicalExpression = (): Expression => {
  let left: Expression = parseAdditiveExpression();

  while (getCurrentToken().type === "T_CMP_EQUALS") {
    getCurrentTokenAndRemoveFromList();
    const right = parseAdditiveExpression();

    left = {
      type: "BINARY_EXPRESSION",
      left,
      right,
      operator: "==",
    } as BinaryExpression;
  }

  return left;
};

const parseVariableDeclaration = (): void => {
  const dataTypeToken = getCurrentTokenAndRemoveFromList();
  const identifierToken = getCurrentTokenAndRemoveFromList();
  if (identifierToken.type !== "T_IDENTIFIER") {
    log("Expected identifier, got " + identifierToken.value, ErrorType.E_SYNTAX, ErrorLevel.ERROR);
  }
  const nextToken = getCurrentTokenAndRemoveFromList();

  if (nextToken.type === "T_EOI" || nextToken.type === "T_ASSIGN") {
    const variableDeclaration: VariableDeclaration = {
      type: "VARIABLE_DECLARATION",
      identifier: identifierToken.value,
      value: nextToken.type === "T_EOI" ? undefined : parseExpression(),
      dataType: dataTypeToken.value,
    };

    addStatement(variableDeclaration);
  } else if (nextToken.type === "T_PARENTHESIS_OPEN") {
    console.log("Function definition");
  }
};

const parseAdditiveExpression = (): Expression => {
  let left: Expression = parseMultiplicativeExpression();
  while (getCurrentToken().type === "T_PLUS" || getCurrentToken().type == "T_MINUS") {
    const operator = getCurrentTokenAndRemoveFromList().value;
    const right = parseMultiplicativeExpression();

    left = {
      type: "BINARY_EXPRESSION",
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

const parsePrimaryExpression = (): Expression | Identifier | VariableAssignment => {
  const token = getCurrentToken();
  switch (token.type) {
    case "T_IDENTIFIER": {
      const symbol = getCurrentTokenAndRemoveFromList().value;
      const nextToken = getCurrentToken();

      if (nextToken.type === "T_ASSIGN") {
        getCurrentTokenAndRemoveFromList();
        return {
          type: "VARIABLE_ASSIGNMENT",
          identifier: symbol,
          value: parseExpression(),
        };
      }

      return {
        type: "IDENTIFIER",
        symbol: symbol,
      };
    }

    case "T_NUMERIC_LITERAL": {
      return {
        type: "NUMERIC_LITERAL",
        value: BigInt(getCurrentTokenAndRemoveFromList().value),
      } as NumericLiteral;
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
