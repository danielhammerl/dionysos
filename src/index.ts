#!/usr/bin/env ts-node-script

import { preprocessing } from "./preprocessor";

console.log("Starting dionysos dca compiler ...");

import fs from "fs";
import { lexicate } from "./lexer";

const startTime = performance.now();

const dummyCode = fs.readFileSync("./dummyCode.txt", { encoding: "utf-8" });

const preprocessed = preprocessing(dummyCode);

const lexicated = lexicate(preprocessed);
console.log(lexicated);

const endTime = performance.now();
console.log("Compilation finished successfully in " + Math.round(endTime - startTime) / 1000 + "s");
