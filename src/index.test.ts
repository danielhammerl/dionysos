import fs from "fs";
import { runCompiler } from "./run";

describe("Dionysos", () => {
  it("should compile code correctly", () => {
    const numberOfTests = fs.readdirSync("./test").length / 2;

    for (let i = 1; i <= numberOfTests; i++) {
      const input = fs.readFileSync("./test/input" + i + ".txt").toString();
      const output = fs.readFileSync("./test/output" + i + ".txt").toString();

      expect(input.length).toBeGreaterThan(10);
      expect(output.length).toBeGreaterThan(10);
      expect(input).not.toEqual(output);

      expect(runCompiler(input)).toEqual(output);
    }
  });
});
