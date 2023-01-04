import {
  byteToDec,
  decToByte,
  decToHalfWord,
  decToHex,
  halfWordToDec,
  hexToDec,
  isBit,
  isByte,
  isHalfWord
} from "./util";

describe("util", () => {
  it("hexToDec", () => {
    expect(hexToDec("#00000000")).toBe(0);
    expect(hexToDec("00000000")).toBe(0);
    expect(hexToDec("00000010")).toBe(16);
    expect(hexToDec("ffff")).toBe(65535);
    expect(hexToDec("#fFfa")).toBe(65530);
  });
  it("decToHex", () => {
    expect(decToHex(23)).toBe("0x17");
    expect(decToHex(23, false)).toBe("17");
    expect(() => decToHex(-12)).toThrowError();
  });
  it("decToByte", () => {
    expect(decToByte(84)).toBe("01010100");
    expect(decToByte(0)).toBe("00000000");
    expect(() => decToByte(-1)).toThrow();
    expect(decToByte(255)).toBe("11111111");
    expect(decToByte(256)).toBe("00000000");
  });
  it("byteToDec", () => {
    expect(byteToDec("00000000")).toBe(0);
    expect(byteToDec("00000001")).toBe(1);
    expect(byteToDec("11111111")).toBe(255);
  });
  it("decToHalfWord", () => {
    expect(() => decToHalfWord(-1)).toThrow();
    expect(decToHalfWord(0)).toEqual(["00000000", "00000000"]);
    expect(decToHalfWord(1)).toEqual(["00000000", "00000001"]);
    expect(decToHalfWord(256)).toEqual(["00000001", "00000000"]);
    expect(decToHalfWord(257)).toEqual(["00000001", "00000001"]);
    expect(decToHalfWord(65535)).toEqual(["11111111", "11111111"]);
    expect(decToHalfWord(65536)).toEqual(["00000000", "00000000"]);
  });
  it("halfWordToDec", () => {
    expect(halfWordToDec(["00000000", "00000000"])).toEqual(0);
    expect(halfWordToDec(["00000000", "00000001"])).toEqual(1);
    expect(halfWordToDec(["00000001", "00000000"])).toEqual(256);
    expect(halfWordToDec(["00000001", "00000001"])).toEqual(257);
    expect(halfWordToDec(["11111111", "11111111"])).toEqual(65535);
  });
  it("isBit", () => {
    expect(isBit("0")).toEqual(true);
    expect(isBit("1")).toEqual(true);
    expect(isBit("10")).toEqual(false);
    expect(isBit("afjajfl")).toEqual(false);
    expect(isBit("00")).toEqual(false);
  });
  it("isByte", () => {
    expect(isByte("00000000")).toEqual(true);
    expect(isByte("10011101")).toEqual(true);
    expect(isByte("1001110")).toEqual(false);
    expect(isByte("abcdefgh")).toEqual(false);
    expect(isByte("00000002")).toEqual(false);
  });
  it("isHalfWord", () => {
    expect(isHalfWord(["00000000", "00000000"])).toBe(true);
    expect(isHalfWord(["11111111", "11111111"])).toBe(true);
    expect(isHalfWord(["01100110", "11000100"])).toBe(true);
    expect(isHalfWord(["1000000", "11000100"])).toBe(false);
    expect(isHalfWord(["10000000", "1100010"])).toBe(false);
    expect(isHalfWord(["10000000", "1100010a"])).toBe(false);
  });
});
