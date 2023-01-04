#!/usr/bin/env ts-node-script
import { Compiler } from "./compiler";

require("util").inspect.defaultOptions.depth = null;

console.log("Starting dionysos dca compiler ...");
import { preprocessing } from "./preprocessor";
import fs from "fs";
import { lexicate } from "./lexer";
import { Parser } from "./parser";

const startTime = performance.now();

const dummyCode = fs.readFileSync("./dummyCode.txt", { encoding: "utf-8" });

const preprocessed = preprocessing(dummyCode);

const tokens = lexicate(preprocessed);

const parser = new Parser();
const ast = parser.parse(tokens);

console.log(ast);

const compiler = new Compiler();
const compiled = compiler.compile(ast);

fs.writeFileSync("./dummyCodeCompiled.txt", compiled, { encoding: "utf-8" });

const endTime = performance.now();
console.log("Compilation finished successfully in " + Math.round(endTime - startTime) / 1000 + "s");
