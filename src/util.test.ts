import { decToHex, hexToDec, isBit } from "./util";

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
  it("isBit", () => {
    expect(isBit("0")).toEqual(true);
    expect(isBit("1")).toEqual(true);
    expect(isBit("10")).toEqual(false);
    expect(isBit("afjajfl")).toEqual(false);
    expect(isBit("00")).toEqual(false);
  });
});
