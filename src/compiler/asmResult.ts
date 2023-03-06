import { INSTRUCTION_BYTE_LENGTH } from "@danielhammerl/dca-architecture";
import * as _ from "lodash";

const calculatedAsmLines: string[] = [];

export function getNextFreeAsmLineNumber(): number {
  return calculatedAsmLines.length * INSTRUCTION_BYTE_LENGTH;
}

export function addAsmLines(lines: string | string[]): void {
  const linesAsArray = Array.isArray(lines) ? lines : [lines];
  linesAsArray.filter((item) => item.length !== 0).forEach((line) => calculatedAsmLines.push(line));
}

export function getCalculatedAsmLines(): string[] {
  return _.cloneDeep(calculatedAsmLines);
}
