import {
  BinaryExpression,
  Identifier,
  NumericLiteral,
  Program,
  Statement,
  VariableDeclaration,
} from "./types/ast";
import { HalfWord, Instructions, Registers } from "@danielhammerl/dca-architecture";
import * as lodash from "lodash";
import { ErrorLevel, ErrorType, log } from "./error";
import { bigIntToHex } from "./util";
import { REGISTER_USAGE_TYPE, Variable } from "./types/compiler";

export class Compiler {
  private asmLines: string[] = [];

  private variableRegistry: Variable[] = [];

  private addAsmLines(lines: string | string[]) {
    if (Array.isArray(lines)) {
      lines.forEach((line) => this.asmLines.push(line));
    } else {
      this.asmLines.push(lines);
    }
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

  private getNextFreeRegister(): string {
    const nextFreeRegister =
      Object.keys(this.registers).find(
        (key) => this.registers[key as typeof Registers[number]] === "FREE"
      ) || null;

    if (nextFreeRegister === null) {
      // handle this
      log("No free register!", ErrorType.E_NOT_IMPLEMENTED, ErrorLevel.INTERNAL);
    }

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
        this.registers[right as typeof Registers[number]] = "LITERAL";
        return left;
      }
      case "-": {
        this.buildAsmLine("SUB", left, right);
        this.registers[right as typeof Registers[number]] = "LITERAL";
        return left;
      }
      default: {
        log(
          "Not implemented binary expression operator value",
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
            const registerToUse = this.getNextFreeRegister();
            this.buildAsmLine("SET", registerToUse, "0x0");
            this.registers[registerToUse as typeof Registers[number]] = "VARIABLE";

            return registerToUse;
          }
        } else {
          log("Undefined identifier : " + identifier, ErrorType.E_UNDEFINED, ErrorLevel.ERROR);
        }
        break;
      }

      case "VARIABLE_DECLARATION": {
        const { identifier, dataType, value } = statement as VariableDeclaration;

        if (dataType !== "uint8" && dataType !== "uint16") {
          log(
            "Unrecognized datatype: " + dataType,
            ErrorType.E_UNRECOGNIZED_TOKEN,
            ErrorLevel.INTERNAL
          );
        }

        const valueStoredAt = value ? this.compileStatement(value) : null;

        const variable: Variable = { identifier, dataType, storedAt: valueStoredAt };
        if (valueStoredAt) {
          this.registers[valueStoredAt as typeof Registers[number]] = "VARIABLE";
        }
        this.variableRegistry.push(variable);
        return variable.storedAt || "";
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
