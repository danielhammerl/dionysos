import { preprocessing } from "./preprocessor/preprocessor";
import { lexicate } from "./lexer/lexer";
import { parse } from "./parser/parser";
import { compile } from "./compiler/compiler";

export function runCompiler(source: string, options?: any): string {
  const preprocessed = preprocessing(source);

  const tokens = lexicate(preprocessed);

  const ast = parse(tokens);

  if (options?.debug) {
    console.log("Logging ast as json ...");
    console.log("----------   ");
    console.log(JSON.stringify(ast, (_, v) => (typeof v === "bigint" ? v.toString() : v)));
    console.log("----------   ");
  }

  return compile(ast);
}
