#!/usr/bin/env ts-node-script
import { Compiler } from "./compiler";
require("util").inspect.defaultOptions.depth = null;
import { preprocessing } from "./preprocessor";
import fs from "fs";
import { lexicate } from "./lexer";
import { Parser } from "./parser";
import { program } from "commander";

function runCompiler(source: string, output: string, options: any) {
  console.log("Starting dionysos dca compiler ...");

  const startTime = performance.now();

  const dummyCode = fs.readFileSync(source, { encoding: "utf-8" });

  const preprocessed = preprocessing(dummyCode);

  const tokens = lexicate(preprocessed);

  const parser = new Parser();
  const ast = parser.parse(tokens);

  if (options.debug) {
    console.log(ast);
  }

  const compiler = new Compiler();
  const compiled = compiler.compile(ast);

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
    runCompiler(source, output, options);
  });

program.parse();
