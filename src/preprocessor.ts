/* The preprocessor does some stuff before lexing starts. This contains:
    - removing line comments
    - removing empty lines
    - trim lines
 */

export const preprocessing = (input: string): string => {
  return trimLines(removeEmptyLines(removeComments(input)));
};

export const removeComments = (input: string): string => {
  return input.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
};

export const removeEmptyLines = (input: string): string => {
  return input
    .split(/\r?\n/)
    .map((line) => {
      if (line.replaceAll(" ", "").replaceAll("\t", "").length === 0) {
        return;
      }

      return line;
    })
    .join("");
};

export const trimLines = (input: string): string => {
  return input
    .split(/\r?\n/)
    .map((item) => item.trim())
    .join("");
};
