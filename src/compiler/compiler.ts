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
import { CompilationStep, ErrorLevel, ErrorType, log } from "../utils/log";
import { bigIntToHex, decToHex } from "../utils/util";
import { FunctionDef, Scope, Variable } from "./types";
import { assignRegister, freeRegister, getNextFreeRegister, RegisterName } from "./register";
import { addAsmLines, getCalculatedAsmLines, getNextFreeAsmLineNumber } from "./asmResult";
import { getLineOffsetInBytes } from "./utils";
import { addVariable, findVariable } from "./variables";

const functionRegistry: FunctionDef[] = [];

function buildAsmLine(
  instruction: typeof Instructions[number],
  operand1: string,
  operand2: string | HalfWord
) {
  const operand2AsString = Array.isArray(operand2) ? operand2.join(" ") : operand2;
  addAsmLines(`${instruction} ${operand1} ${operand2AsString}`);
}

// START HERE
export function compile(program: Program): string {
  const { body } = program;

  body.forEach((statement) => {
    compileStatement(statement, null);
  });

  return getCalculatedAsmLines().join("\n");
}

function evaluateBinaryExpression(statement: BinaryExpression, scope: Scope | null): RegisterName {
  const left = compileStatement(statement.left, scope);
  const right = compileStatement(statement.right, scope);

  if (!left) {
    log(
      "left hand operator of binary expression have to be an expression",
      ErrorType.E_SYNTAX,
      CompilationStep.COMPILING,
      ErrorLevel.ERROR
    );
  }
  if (!right) {
    log(
      "right hand operator of binary expression have to be an expression",
      ErrorType.E_SYNTAX,
      CompilationStep.COMPILING,
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
      const resultRegister = getNextFreeRegister("LITERAL");
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
        CompilationStep.COMPILING,
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
function compileStatement(statement: Statement, scope: Scope | null): RegisterName | null {
  switch (statement.statementType) {
    case "VARIABLE_DEFINITION_STATEMENT": {
      const { identifier, dataType, value } = statement as VariableDefinitionStatement;

      if (dataType !== "uint16") {
        log(
          "Unrecognized datatype: " + dataType,
          ErrorType.E_UNRECOGNIZED_TOKEN,
          CompilationStep.COMPILING,
          ErrorLevel.INTERNAL
        );
      }
      if (findVariable(identifier.symbol, scope)) {
        log(
          "Cannot redeclare variable " + identifier.symbol,
          ErrorType.E_IDENTIFIER_IN_USE,
          CompilationStep.COMPILING,
          ErrorLevel.ERROR
        );
      }
      const valueStoredAt = value ? compileStatement(value, scope) : null;

      const variable: Variable = {
        identifier: identifier.symbol,
        dataType,
        storedAt: valueStoredAt,
      };
      if (valueStoredAt) {
        assignRegister(valueStoredAt, "VARIABLE");
      }
      addVariable(variable);
      return variable.storedAt;
    }

    case "EXPRESSION_STATEMENT": {
      return compileExpression(statement as Expression, scope);
    }

    case "FUNCTION_DEFINITION_STATEMENT": {
      console.log("OK");
    }

    default: {
      log(
        "Not implemented statement " + statement.statementType,
        ErrorType.E_NOT_IMPLEMENTED,
        CompilationStep.COMPILING,
        ErrorLevel.INTERNAL
      );
    }
  }
}

function compileExpression(expression: Expression, scope: Scope | null): RegisterName | null {
  switch (expression.expressionType) {
    case "BINARY_EXPRESSION": {
      return evaluateBinaryExpression(expression as BinaryExpression, scope);
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
      const variable = findVariable(identifier, scope);
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
        return log(
          "Undefined identifier : " + identifier,
          ErrorType.E_UNDEFINED,
          CompilationStep.COMPILING,
          ErrorLevel.ERROR
        );
      }
    }

    case "VARIABLE_ASSIGNMENT_EXPRESSION": {
      const { identifier, value } = expression as VariableAssignmentExpression;
      const variable = findVariable(identifier.symbol, scope);
      if (!variable) {
        return log(
          "Undefined variable " + variable,
          ErrorType.E_UNDEFINED,
          CompilationStep.COMPILING,
          ErrorLevel.ERROR
        );
      }

      variable.storedAt = compileStatement(value, scope);

      if (variable.storedAt) {
        assignRegister(variable.storedAt, "VARIABLE");
      }

      return variable.storedAt;
    }

    default: {
      return log(
        "Not implemented expression " + expression.expressionType,
        ErrorType.E_NOT_IMPLEMENTED,
        CompilationStep.COMPILING,
        ErrorLevel.INTERNAL
      );
    }
  }
}
