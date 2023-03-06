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

export class Compiler {
  private asmLines: string[] = [];
  private getNextFreeAsmLineNumber(): number {
    return this.asmLines.length * INSTRUCTION_BYTE_LENGTH;
  }

  private getBytesPerLine(count: number): number {
    return count * INSTRUCTION_BYTE_LENGTH;
  }

  private variableRegistry: Variable[] = [];

  private addAsmLines(lines: string | string[]) {
    if (Array.isArray(lines)) {
      lines.forEach((line) => this.asmLines.push(line));
    } else {
      this.asmLines.push(lines);
    }
    this.asmLines = this.asmLines.filter((item) => item.length !== 0);
  }

  private buildAsmLine(
    instruction: typeof Instructions[number],
    operand1: string,
    operand2: string | HalfWord
  ) {
    const operand2AsString = Array.isArray(operand2) ? operand2.join(" ") : operand2;
    this.addAsmLines(`${instruction} ${operand1} ${operand2AsString}`);
  }
  private registers: Partial<Record<typeof Registers[number], REGISTER_USAGE_TYPE>> = {
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

  private freeAllRegisters() {
    lodash.mapValues(this.registers, () => "FREE");
  }

  // TODO implement algorithm for freeing the right register when one is needed
  private getNextFreeRegister(newState: REGISTER_USAGE_TYPE = "FREE"): string {
    const nextFreeRegister =
      Object.keys(this.registers).find(
        (key) => this.registers[key as typeof Registers[number]] === "FREE"
      ) || null;

    if (nextFreeRegister === null) {
      // handle this
      log("No free register!", ErrorType.E_NOT_IMPLEMENTED, ErrorLevel.INTERNAL);
    }

    this.registers[nextFreeRegister as typeof Registers[number]] = newState;

    return nextFreeRegister;
  }

  public compile(program: Program): string {
    const { body } = program;

    body.forEach((statement) => {
      this.compileStatement(statement);
    });

    return this.asmLines.join("\n");
  }

  private evaluateBinaryExpression(statement: BinaryExpression): string {
    const left = this.compileStatement(statement.left);
    const right = this.compileStatement(statement.right);

    switch (statement.operator) {
      case "+": {
        this.buildAsmLine("ADD", left, right);
        this.registers[right as typeof Registers[number]] = "FREE";
        return left;
      }
      case "-": {
        this.buildAsmLine("SUB", left, right);
        this.registers[right as typeof Registers[number]] = "FREE";
        return left;
      }
      // evtl einfacher das nicht mit CJUMP zu lösen sondern einen CMP operator einzuführen
      case "==": {
        const resultRegister = this.getNextFreeRegister("MANUAL");
        this.registers[resultRegister as typeof Registers[number]] = "LITERAL";
        this.buildAsmLine("MOV", left, resultRegister);
        this.buildAsmLine("SUB", resultRegister, right);
        // result register now contains 0 for truthy values or non zero for falsy values
        const tempRegisterForOriginalResult = this.getNextFreeRegister("MANUAL");
        this.buildAsmLine("MOV", resultRegister, tempRegisterForOriginalResult);
        this.buildAsmLine("SET", resultRegister, decToHex(1));
        const registerForJumpDestination = this.getNextFreeRegister("MANUAL");
        this.buildAsmLine(
          "SET",
          registerForJumpDestination,
          decToHex(this.getNextFreeAsmLineNumber() + this.getBytesPerLine(3))
        );
        this.buildAsmLine("CJUMP", registerForJumpDestination, tempRegisterForOriginalResult);
        this.buildAsmLine("SET", resultRegister, decToHex(0));
        this.registers[registerForJumpDestination as typeof Registers[number]] = "FREE";
        this.registers[tempRegisterForOriginalResult as typeof Registers[number]] = "FREE";
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

  private compileStatement(statement: Statement): string {
    switch (statement.type) {
      case "BINARY_EXPRESSION": {
        return this.evaluateBinaryExpression(statement as BinaryExpression);
      }

      case "NUMERIC_LITERAL": {
        const registerToUse = this.getNextFreeRegister();

        this.buildAsmLine(
          "SET",
          registerToUse,
          bigIntToHex((statement as NumericLiteral).value.valueOf())
        );
        this.registers[registerToUse as typeof Registers[number]] = "LITERAL";

        return registerToUse;
      }

      case "IDENTIFIER": {
        const identifier = (statement as Identifier).symbol;
        const variable = this.variableRegistry.find(
          (variable) => variable.identifier === identifier
        );
        if (variable) {
          if (variable.storedAt !== null) {
            return variable.storedAt;
          } else {
            const registerToUse = this.getNextFreeRegister("VARIABLE");
            this.buildAsmLine("SET", registerToUse, "0x0");

            return registerToUse;
          }
        } else {
          return log(
            "Undefined identifier : " + identifier,
            ErrorType.E_UNDEFINED,
            ErrorLevel.ERROR
          );
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
        const valueStoredAt = value ? this.compileStatement(value) : null;

        const variable: Variable = { identifier, dataType, storedAt: valueStoredAt };
        if (valueStoredAt) {
          this.registers[valueStoredAt as typeof Registers[number]] = "VARIABLE";
        }
        this.variableRegistry.push(variable);
        return variable.storedAt || "";
      }

      case "VARIABLE_ASSIGNMENT": {
        const { identifier, value } = statement as VariableAssignment;
        const variable = this.variableRegistry.find((item) => item.identifier === identifier);
        if (!variable) {
          return log("Undefined variable " + variable, ErrorType.E_UNDEFINED, ErrorLevel.ERROR);
        }

        variable.storedAt = this.compileStatement(value);
        this.registers[variable.storedAt as typeof Registers[number]] = "VARIABLE";
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
}
