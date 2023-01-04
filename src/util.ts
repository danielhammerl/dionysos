import {
  Bit,
  Byte,
  BYTE_LENGTH,
  HALF_WORD_LENGTH,
  HalfWord,
  MAX_BYTE_VALUE,
  MAX_HALF_WORD_VALUE,
} from "@danielhammerl/dca-architecture";

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

export const decToByte = (dec: number): Byte => {
  if (dec < 0) {
    throw new Error("decToByte only supports positive numbers and zero");
  }
  const normalizedValue = dec % (MAX_BYTE_VALUE + 1);
  return normalizedValue.toString(2).padStart(BYTE_LENGTH, "0") as Byte;
};
export const byteToDec = (byte: Byte): number => parseInt(byte, 2);

export const byteToHex = (byte: Byte): string => decToHex(byteToDec(byte));
export const halfWordToHex = (halfWord: HalfWord): string => decToHex(halfWordToDec(halfWord));

export const decToHalfWord = (dec: number): HalfWord => {
  if (dec < 0) {
    throw new Error("decToHalfWord only supports positive numbers and zero");
  }
  const normalizedValue = dec % (MAX_HALF_WORD_VALUE + 1);
  const halfWordAsString = normalizedValue.toString(2).padStart(HALF_WORD_LENGTH, "0");
  return byteStringToHalfWord(halfWordAsString);
};

export const bigIntToHalfWord = (bigInt: bigint): HalfWord => {
  if (bigInt < 0) {
    throw new Error("decToHalfWord only supports positive numbers and zero");
  }
  const normalizedValue = bigInt % BigInt(MAX_HALF_WORD_VALUE + 1);
  const halfWordAsString = normalizedValue.toString(2).padStart(HALF_WORD_LENGTH, "0");
  return byteStringToHalfWord(halfWordAsString);
};

export const halfWordToDec = (halfWord: HalfWord): number => {
  const normalizedValue = halfWord.join("");
  return parseInt(normalizedValue, 2);
};

export const byteStringToHalfWord = (byteString: string): HalfWord => {
  const normalizedValue = byteString.padStart(HALF_WORD_LENGTH, "0");
  const first = normalizedValue.substring(0, BYTE_LENGTH) as Byte;
  const last = normalizedValue.substring(BYTE_LENGTH, HALF_WORD_LENGTH) as Byte;
  return [first, last];
};

export const isBit = (data: string): data is Bit => {
  return data === "1" || data === "0";
};

export const isByte = (data: string): data is Byte => {
  return data.length === BYTE_LENGTH && data.replaceAll("1", "").replaceAll("0", "").length === 0;
};

export const isHalfWord = (data: string[]): data is HalfWord => {
  return data.every(isByte);
};

export const getBaseLog = (x: number, y: number): number => {
  return Math.log(y) / Math.log(x);
};
