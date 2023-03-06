import { preprocessing } from "./preprocessor/preprocessor";
import { lexicate } from "./lexer/lexer";
import { Parser } from "./parser/parser";
import { Compiler } from "./compiler/compiler";

export function runCompiler(source: string, options?: any): string {
  const preprocessed = preprocessing(source);

  const tokens = lexicate(preprocessed);

  const parser = new Parser();
  const ast = parser.parse(tokens);

  if (options?.debug) {
    console.log(ast);
  }

  const compiler = new Compiler();
  return compiler.compile(ast);
}