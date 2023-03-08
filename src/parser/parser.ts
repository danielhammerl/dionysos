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

export class Parser {
  private _tokens: Token[] = [];
  private _statements: Statement[] = [];
  private _functions: FunctionDefinition[] = [];
  private getCurrentToken(): Token {
    return this._tokens[0];
  }

  private getCurrentTokenAndRemoveFromList(): Token {
    return this._tokens.shift()!;
  }

  private addStatement(statement: Statement) {
    this._statements.push(statement);
  }

  public parse(input: Token[]): Program {
    this._tokens = [...input];

    while (this.getCurrentToken().type !== "T_EOF") {
      if (this.getCurrentToken().type === "T_EOI") {
        this.getCurrentTokenAndRemoveFromList();
      } else {
        this.parseStatement();
      }
    }

    return {
      type: "PROGRAM",
      body: this._statements,
    };
  }

  private parseStatement(): void {
    const token = this.getCurrentToken();
    switch (token.type) {
      case "T_DATA_TYPE": {
        this.parseVariableDeclaration();
        break;
      }
      default: {
        this.parseExpression();
        break;
      }
    }
  }

  private parseExpression(): Expression {
    return this.parseLogicalExpression();
  }

  private parseLogicalExpression(): Expression {
    let left: Expression = this.parseAdditiveExpression();

    while (this.getCurrentToken().type === "T_CMP_EQUALS") {
      this.getCurrentTokenAndRemoveFromList();
      const right = this.parseAdditiveExpression();

      left = {
        type: "BINARY_EXPRESSION",
        left,
        right,
        operator: "==",
      } as BinaryExpression;
    }

    return left;
  }

  private parseVariableDeclaration(): void {
    const dataTypeToken = this.getCurrentTokenAndRemoveFromList();
    const identifierToken = this.getCurrentTokenAndRemoveFromList();
    if (identifierToken.type !== "T_IDENTIFIER") {
      log(
        "Expected identifier, got " + identifierToken.value,
        ErrorType.E_SYNTAX,
        ErrorLevel.ERROR
      );
    }
    const nextToken = this.getCurrentTokenAndRemoveFromList();

    if (nextToken.type === "T_EOI" || nextToken.type === "T_ASSIGN") {
      const variableDeclaration: VariableDeclaration = {
        type: "VARIABLE_DECLARATION",
        identifier: identifierToken.value,
        value: nextToken.type === "T_EOI" ? undefined : this.parseExpression(),
        dataType: dataTypeToken.value,
      };

      this.addStatement(variableDeclaration);
    } else if(nextToken.type === "T_PARENTHESIS_OPEN") {
      console.log("Function definition");
    }
  }

  private parseAdditiveExpression(): Expression {
    let left: Expression = this.parseMultiplicativeExpression();
    while (this.getCurrentToken().type === "T_PLUS" || this.getCurrentToken().type == "T_MINUS") {
      const operator = this.getCurrentTokenAndRemoveFromList().value;
      const right = this.parseMultiplicativeExpression();

      left = {
        type: "BINARY_EXPRESSION",
        left,
        right,
        operator,
      } as BinaryExpression;
    }
    return left;
  }
  private parseMultiplicativeExpression(): Expression {
    // no multiplication for now!
    return this.parsePrimaryExpression();
  }

  private parsePrimaryExpression(): Expression | Identifier | VariableAssignment {
    const token = this.getCurrentToken();
    switch (token.type) {
      case "T_IDENTIFIER": {
        const symbol = this.getCurrentTokenAndRemoveFromList().value;
        const nextToken = this.getCurrentToken();

        if (nextToken.type === "T_ASSIGN") {
          this.getCurrentTokenAndRemoveFromList();
          return {
            type: "VARIABLE_ASSIGNMENT",
            identifier: symbol,
            value: this.parseExpression(),
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
          value: BigInt(this.getCurrentTokenAndRemoveFromList().value),
        } as NumericLiteral;
      }

      case "T_PARENTHESIS_OPEN": {
        this.getCurrentTokenAndRemoveFromList();
        const value = this.parseExpression();
        const token = this.getCurrentTokenAndRemoveFromList();
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
  }
}
