import { dataTypeList } from "./internalDataTypes";

export interface Variable {
  identifier: string;
  dataType: Omit<typeof dataTypeList[number], "void">;
  storedAt: string | null;
}

export type REGISTER_USAGE_TYPE = "FREE" | "LITERAL" | "VARIABLE" | "MANUAL";
