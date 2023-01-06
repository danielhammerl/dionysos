import { Bit, Registers } from "@danielhammerl/dca-architecture";

export const isAlphaNumeric = (input: string): boolean => {
  return RegExp(/^[a-z0-9]+$/i).test(input);
};

export const isNumeric = (input: string): boolean => {
  return RegExp(/^\d+$/).test(input);
};

export const hexToDec = (hex: string): number =>
  parseInt(hex.replaceAll("#", "").replaceAll("0x", ""), 16);

export const decToHex = (dec: number, withPrefix: boolean = true): string => {
  if (dec < 0) {
    throw new Error("decToHex only supports positive numbers and zero");
  }
  return (withPrefix ? "0x" : "") + dec.toString(16).padStart(2, "0");
};

export const bigIntToHex = (dec: bigint, withPrefix: boolean = true): string => {
  if (dec < 0) {
    throw new Error("decToHex only supports positive numbers and zero");
  }
  return (withPrefix ? "0x" : "") + dec.toString(16).padStart(2, "0");
};

export const isBit = (data: string): data is Bit => {
  return data === "1" || data === "0";
};

export const getBaseLog = (x: number, y: number): number => {
  return Math.log(y) / Math.log(x);
};

export const isRegister = (data: string): data is typeof Registers[number] =>
  Registers.includes(data as any);
