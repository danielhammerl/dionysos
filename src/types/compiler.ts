import { dataTypeList } from "./internalDataTypes";

export interface Variable {
  identifier: string;
  dataType: typeof dataTypeList[number];
  storedAt: string | null;
}

export type REGISTER_USAGE_TYPE = "FREE" | "LITERAL" | "VARIABLE" | "MANUAL";
