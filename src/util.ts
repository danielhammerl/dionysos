export const isAlphaNumeric = (input: string): boolean => {
  return RegExp(/^[a-z0-9]+$/i).test(input);
};

export const isNumeric = (input: string): boolean => {
  return RegExp(/^\d+$/).test(input);
};
