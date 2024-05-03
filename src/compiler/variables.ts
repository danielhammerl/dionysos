import { Scope, Variable } from "./types";

const globalVariableRegistry: Variable[] = [];

export function findVariable(identifier: Variable["identifier"], scope: Scope | null) {
  return (
    scope?.variables?.find((variable) => variable.identifier === identifier) ??
    globalVariableRegistry.find((variable) => variable.identifier === identifier)
  );
}

export function addGlobalVariable(variable: Variable) {
  addVariable(variable, null);
}

export function addVariable(variable: Variable, scope: Scope | null) {
  if (scope === null) {
    globalVariableRegistry.push(variable);
  } else {
    scope.variables.push(variable);
  }
}
