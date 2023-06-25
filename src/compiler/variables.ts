import { Scope, Variable } from "./types";

const globalVariableRegistry: Variable[] = [];

export function findVariable(identifier: Variable["identifier"], scope: Scope | null) {
  return (
    scope?.variables?.find((variable) => variable.identifier === identifier) ??
    globalVariableRegistry.find((variable) => variable.identifier === identifier)
  );
}

export function addVariable(variable: Variable) {
  globalVariableRegistry.push(variable);
}
