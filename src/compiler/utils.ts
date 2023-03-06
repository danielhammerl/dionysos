import { INSTRUCTION_BYTE_LENGTH } from "@danielhammerl/dca-architecture";

export function getLineOffsetInBytes(count: number): number {
  return count * INSTRUCTION_BYTE_LENGTH;
}
