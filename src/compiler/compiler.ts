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
import { HalfWord, Instructions } from "@danielhammerl/dca-architecture";
import { ErrorLevel, ErrorType, log } from "../utils/log";
import { bigIntToHex, decToHex } from "../utils/util";
import { Variable } from "./types";
import { assignRegister, freeRegister, getNextFreeRegister, RegisterName } from "./register";
import { addAsmLines, getCalculatedAsmLines, getNextFreeAsmLineNumber } from "./asmResult";
import { getLineOffsetInBytes } from "./utils";

const variableRegistry: Variable[] = [];

function buildAsmLine(
  instruction: typeof Instructions[number],
  operand1: string,
  operand2: string | HalfWord
) {
  const operand2AsString = Array.isArray(operand2) ? operand2.join(" ") : operand2;
  addAsmLines(`${instruction} ${operand1} ${operand2AsString}`);
}

export function compile(program: Program): string {
  const { body } = program;

  body.forEach((statement) => {
    compileStatement(statement);
  });

  return getCalculatedAsmLines().join("\n");
}

function evaluateBinaryExpression(statement: BinaryExpression): RegisterName {
  const left = compileStatement(statement.left);
  const right = compileStatement(statement.right);

  if (!left) {
    log(
      "left hand operator of binary expression have to be an expression",
      ErrorType.E_SYNTAX,
      ErrorLevel.ERROR
    );
  }
  if (!right) {
    log(
      "right hand operator of binary expression have to be an expression",
      ErrorType.E_SYNTAX,
      ErrorLevel.ERROR
    );
  }

  switch (statement.operator) {
    case "+": {
      buildAsmLine("ADD", left, right);
      freeRegister(right);
      return left;
    }
    case "-": {
      buildAsmLine("SUB", left, right);
      freeRegister(right);
      return left;
    }
    // evtl einfacher das nicht mit CJUMP zu lösen, sondern einen CMP operator einzuführen
    case "==": {
      const resultRegister = getNextFreeRegister("MANUAL");
      assignRegister(resultRegister, "LITERAL");
      buildAsmLine("MOV", left, resultRegister);
      buildAsmLine("SUB", resultRegister, right);
      // result register now contains 0 for truthy values or non zero for falsy values
      const tempRegisterForOriginalResult = getNextFreeRegister("MANUAL");
      buildAsmLine("MOV", resultRegister, tempRegisterForOriginalResult);
      buildAsmLine("SET", resultRegister, decToHex(1));
      const registerForJumpDestination = getNextFreeRegister("MANUAL");
      buildAsmLine(
        "SET",
        registerForJumpDestination,
        decToHex(getNextFreeAsmLineNumber() + getLineOffsetInBytes(3))
      );
      buildAsmLine("CJUMP", registerForJumpDestination, tempRegisterForOriginalResult);
      buildAsmLine("SET", resultRegister, decToHex(0));
      freeRegister(registerForJumpDestination);
      freeRegister(tempRegisterForOriginalResult);
      return resultRegister;
    }
    default: {
      log(
        "Not implemented binary expression operator " + statement.operator,
        ErrorType.E_NOT_IMPLEMENTED,
        ErrorLevel.INTERNAL
      );
    }
  }
}

/**
 * this method compiles a statement
 * if the statement is an expression it returns the register
 * in which the result is stored, otherwise it returns null
 */
function compileStatement(statement: Statement): RegisterName | null {
  switch (statement.statementType) {
    case "VARIABLE_DEFINITION_STATEMENT": {
      const { identifier, dataType, value } = statement as VariableDefinitionStatement;

      if (dataType !== "uint16") {
        log(
          "Unrecognized datatype: " + dataType,
          ErrorType.E_UNRECOGNIZED_TOKEN,
          ErrorLevel.INTERNAL
        );
      }

      const valueStoredAt = value ? compileStatement(value) : null;

      const variable: Variable = {
        identifier: identifier.symbol,
        dataType,
        storedAt: valueStoredAt,
      };
      if (valueStoredAt) {
        assignRegister(valueStoredAt, "VARIABLE");
      }
      variableRegistry.push(variable);
      return variable.storedAt;
    }

    case "EXPRESSION_STATEMENT": {
      return compileExpression(statement as Expression);
    }

    default: {
      log(
        "Not implemented statement " + statement.statementType,
        ErrorType.E_NOT_IMPLEMENTED,
        ErrorLevel.INTERNAL
      );
    }
  }
}

function compileExpression(expression: Expression): RegisterName | null {
  switch (expression.expressionType) {
    case "BINARY_EXPRESSION": {
      return evaluateBinaryExpression(expression as BinaryExpression);
    }

    case "NUMBER_LITERAL_EXPRESSION": {
      const registerToUse = getNextFreeRegister("LITERAL");

      buildAsmLine(
        "SET",
        registerToUse,
        bigIntToHex((expression as NumericLiteralExpression).value.valueOf())
      );

      return registerToUse;
    }

    case "IDENTIFIER_LITERAL_EXPRESSION": {
      const identifier = (expression as IdentifierExpression).symbol;
      const variable = variableRegistry.find((variable) => variable.identifier === identifier);
      if (variable) {
        if (variable.storedAt !== null) {
          return variable.storedAt;
        } else {
          const registerToUse = getNextFreeRegister("VARIABLE");
          // default value for undefined variables is 0
          buildAsmLine("SET", registerToUse, "0x0");

          return registerToUse;
        }
      } else {
        return log("Undefined identifier : " + identifier, ErrorType.E_UNDEFINED, ErrorLevel.ERROR);
      }
    }

    case "VARIABLE_ASSIGNMENT_EXPRESSION": {
      const { identifier, value } = expression as VariableAssignmentExpression;
      const variable = variableRegistry.find((item) => item.identifier === identifier.symbol);
      if (!variable) {
        return log("Undefined variable " + variable, ErrorType.E_UNDEFINED, ErrorLevel.ERROR);
      }

      variable.storedAt = compileStatement(value);

      if (variable.storedAt) {
        assignRegister(variable.storedAt, "VARIABLE");
      }

      return variable.storedAt;
    }

    default: {
      return log(
        "Not implemented expression " + expression.expressionType,
        ErrorType.E_NOT_IMPLEMENTED,
        ErrorLevel.INTERNAL
      );
    }
  }
}
