import { Registers } from "@danielhammerl/dca-architecture";
import { RegisterUsage } from "./types";
import * as lodash from "lodash";
import { CompilationStep, ErrorLevel, ErrorType, log } from "../utils/log";

export type RegisterName = typeof Registers[number];

const customRegistersUsageMap: Partial<Record<RegisterName, RegisterUsage>> = {
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

export function freeAllRegisters(): void {
  lodash.mapValues(customRegistersUsageMap, () => "FREE");
}

export function freeRegister(register: RegisterName): void {
  customRegistersUsageMap[register] = "FREE";
}

export function assignRegister(
  register: RegisterName,
  usage: Exclude<RegisterUsage, "FREE">
): void {
  customRegistersUsageMap[register] = usage;
}

// TODO implement algorithm for freeing the right register when one is needed
export function getNextFreeRegister(newState: RegisterUsage): RegisterName {
  const nextFreeRegister =
    (Object.keys(customRegistersUsageMap).find(
      (key) => customRegistersUsageMap[key as RegisterName] === "FREE"
    ) as RegisterName) || null;

  if (nextFreeRegister === null) {
    // handle this
    log(
      "No free register!",
      ErrorType.E_NOT_IMPLEMENTED,
      CompilationStep.COMPILING,
      ErrorLevel.INTERNAL
    );
  }

  customRegistersUsageMap[nextFreeRegister] = newState;

  return nextFreeRegister;
}
