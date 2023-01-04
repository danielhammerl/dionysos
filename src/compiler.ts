import { BinaryExpression, NumericLiteral, Program, Statement } from "./types/ast";
import { HalfWord, Instructions, Registers } from "@danielhammerl/dca-architecture";
import * as lodash from "lodash";
import { ErrorLevel, ErrorType, log } from "./error";
import { bigIntToHalfWord, bigIntToHex, decToHalfWord } from "./util";

export class Compiler {
  private asmLines: string[] = [];

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
  private usedRegisters: Partial<Record<typeof Registers[number], boolean>> = {
    R00: false,
    R01: false,
    R02: false,
    R03: false,
    R04: false,
    R05: false,
    R06: false,
    R07: false,
    R08: false,
    R09: false,
    R10: false,
  };

  private freeAllRegisters() {
    lodash.mapValues(this.usedRegisters, () => false);
  }

  private getNextFreeRegister() {
    return (
      Object.keys(this.usedRegisters).find(
        (key) => !this.usedRegisters[key as typeof Registers[number]]
      ) || null
    );
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
        this.usedRegisters[right as typeof Registers[number]] = false;
        return left;
      }
      case "-": {
        this.buildAsmLine("SUB", left, right);
        this.usedRegisters[right as typeof Registers[number]] = false;
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
    if (statement.type === "BINARY_EXPRESSION") {
      return this.evaluateBinaryExpression(statement as BinaryExpression);
    }

    if (statement.type === "NUMERIC_LITERAL") {
      const registerToUse = this.getNextFreeRegister();
      if (registerToUse === null) {
        log("No free register", ErrorType.E_NOT_IMPLEMENTED, ErrorLevel.INTERNAL);
      }

      this.buildAsmLine(
        "SET",
        registerToUse,
        bigIntToHex((statement as NumericLiteral).value.valueOf())
      );
      this.usedRegisters[registerToUse as typeof Registers[number]] = true;

      return registerToUse;
    }

    log(
      "Not implemented statement " + statement.type,
      ErrorType.E_NOT_IMPLEMENTED,
      ErrorLevel.INTERNAL
    );
  }
}
