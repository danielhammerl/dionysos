#!/usr/bin/env ts-node-script
require("util").inspect.defaultOptions.depth = null;
import fs from "fs";
import { program } from "commander";
import { runCompiler } from "./run";

function run(source: string, output: string, options: any) {
  console.log("Starting dionysos dca compiler ...");

  const startTime = performance.now();

  const input = fs.readFileSync(source, { encoding: "utf-8" });
  const compiled = runCompiler(input, options);
  fs.writeFileSync(output, compiled, { encoding: "utf-8" });

  const endTime = performance.now();
  console.log(
    "Compilation finished successfully in " + Math.round(endTime - startTime) / 1000 + "s"
  );
}

program
  .argument("[source]", "source file", "./dummyCode.txt")
  .argument("[output]", "output file", "./dummyCodeCompiled.dcaasm")
  .option("-d, --debug", "debug mode", false)
  .action((source, output, options) => {
    run(source, output, options);
  });

program.parse();
