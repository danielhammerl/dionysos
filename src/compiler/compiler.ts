import {
  BinaryExpression,
  Identifier,
  NumericLiteral,
  Program,
  Statement,
  VariableAssignment,
  VariableDeclaration,
} from "../types/ast";
import {
  HalfWord,
  INSTRUCTION_BYTE_LENGTH,
  Instructions,
  Registers,
} from "@danielhammerl/dca-architecture";
import * as lodash from "lodash";
import { ErrorLevel, ErrorType, log } from "../utils/log";
import { bigIntToHex, decToHex } from "../utils/util";
import { REGISTER_USAGE_TYPE, Variable } from "./types";

let asmLines: string[] = [];
function getNextFreeAsmLineNumber(): number {
  return asmLines.length * INSTRUCTION_BYTE_LENGTH;
}

function getBytesPerLine(count: number): number {
  return count * INSTRUCTION_BYTE_LENGTH;
}

const variableRegistry: Variable[] = [];

function addAsmLines(lines: string | string[]) {
  if (Array.isArray(lines)) {
    lines.forEach((line) => asmLines.push(line));
  } else {
    asmLines.push(lines);
  }
  asmLines = asmLines.filter((item) => item.length !== 0);
}

function buildAsmLine(
  instruction: typeof Instructions[number],
  operand1: string,
  operand2: string | HalfWord
) {
  const operand2AsString = Array.isArray(operand2) ? operand2.join(" ") : operand2;
  addAsmLines(`${instruction} ${operand1} ${operand2AsString}`);
}
const registers: Partial<Record<typeof Registers[number], REGISTER_USAGE_TYPE>> = {
  R00: "FREE",
  R01: "FREE",
  R02: "FREE",
  R03: "FREE",
  R04: "FREE",
  R05: "FREE",
  R06: "FREE",
  R07: "FREE",
  R08: "FREE",
  R09: "FREE",
  R10: "FREE",
};

function freeAllRegisters() {
  lodash.mapValues(registers, () => "FREE");
}

// TODO implement algorithm for freeing the right register when one is needed
function getNextFreeRegister(newState: REGISTER_USAGE_TYPE = "FREE"): string {
  const nextFreeRegister =
    Object.keys(registers).find((key) => registers[key as typeof Registers[number]] === "FREE") ||
    null;

  if (nextFreeRegister === null) {
    // handle this
    log("No free register!", ErrorType.E_NOT_IMPLEMENTED, ErrorLevel.INTERNAL);
  }

  registers[nextFreeRegister as typeof Registers[number]] = newState;

  return nextFreeRegister;
}

export function compile(program: Program): string {
  const { body } = program;

  body.forEach((statement) => {
    compileStatement(statement);
  });

  return asmLines.join("\n");
}

function evaluateBinaryExpression(statement: BinaryExpression): string {
  const left = compileStatement(statement.left);
  const right = compileStatement(statement.right);

  switch (statement.operator) {
    case "+": {
      buildAsmLine("ADD", left, right);
      registers[right as typeof Registers[number]] = "FREE";
      return left;
    }
    case "-": {
      buildAsmLine("SUB", left, right);
      registers[right as typeof Registers[number]] = "FREE";
      return left;
    }
    // evtl einfacher das nicht mit CJUMP zu lösen sondern einen CMP operator einzuführen
    case "==": {
      const resultRegister = getNextFreeRegister("MANUAL");
      registers[resultRegister as typeof Registers[number]] = "LITERAL";
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
        decToHex(getNextFreeAsmLineNumber() + getBytesPerLine(3))
      );
      buildAsmLine("CJUMP", registerForJumpDestination, tempRegisterForOriginalResult);
      buildAsmLine("SET", resultRegister, decToHex(0));
      registers[registerForJumpDestination as typeof Registers[number]] = "FREE";
      registers[tempRegisterForOriginalResult as typeof Registers[number]] = "FREE";
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

function compileStatement(statement: Statement): string {
  switch (statement.type) {
    case "BINARY_EXPRESSION": {
      return evaluateBinaryExpression(statement as BinaryExpression);
    }

    case "NUMERIC_LITERAL": {
      const registerToUse = getNextFreeRegister();

      buildAsmLine(
        "SET",
        registerToUse,
        bigIntToHex((statement as NumericLiteral).value.valueOf())
      );
      registers[registerToUse as typeof Registers[number]] = "LITERAL";

      return registerToUse;
    }

    case "IDENTIFIER": {
      const identifier = (statement as Identifier).symbol;
      const variable = variableRegistry.find((variable) => variable.identifier === identifier);
      if (variable) {
        if (variable.storedAt !== null) {
          return variable.storedAt;
        } else {
          const registerToUse = getNextFreeRegister("VARIABLE");
          buildAsmLine("SET", registerToUse, "0x0");

          return registerToUse;
        }
      } else {
        return log("Undefined identifier : " + identifier, ErrorType.E_UNDEFINED, ErrorLevel.ERROR);
      }
    }

    case "VARIABLE_DECLARATION": {
      const { identifier, dataType, value } = statement as VariableDeclaration;

      if (dataType !== "uint16") {
        log(
          "Unrecognized datatype: " + dataType,
          ErrorType.E_UNRECOGNIZED_TOKEN,
          ErrorLevel.INTERNAL
        );
      }
      //TODO data types dont matter yet :D
      const valueStoredAt = value ? compileStatement(value) : null;

      const variable: Variable = { identifier, dataType, storedAt: valueStoredAt };
      if (valueStoredAt) {
        registers[valueStoredAt as typeof Registers[number]] = "VARIABLE";
      }
      variableRegistry.push(variable);
      return variable.storedAt || "";
    }

    case "VARIABLE_ASSIGNMENT": {
      const { identifier, value } = statement as VariableAssignment;
      const variable = variableRegistry.find((item) => item.identifier === identifier);
      if (!variable) {
        return log("Undefined variable " + variable, ErrorType.E_UNDEFINED, ErrorLevel.ERROR);
      }

      variable.storedAt = compileStatement(value);
      registers[variable.storedAt as typeof Registers[number]] = "VARIABLE";
      return variable.storedAt;
    }

    default: {
      log(
        "Not implemented statement " + statement.type,
        ErrorType.E_NOT_IMPLEMENTED,
        ErrorLevel.INTERNAL
      );
    }
  }
}
