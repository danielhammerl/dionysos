import { DataType } from "../constants/dataTypes";
import { RegisterName } from "./register";

export interface Variable {
  identifier: string;
  dataType: Omit<DataType, "void">;
  storedAt: RegisterName | null;
}

export type Function = {
  identifier: string;
}

/**
 * FREE -> this register is free to use
 * LITERAL -> this register contains a literal, might be freed as soon as literal is not be used anymore ( auto freeing is not implemented yet )
 * VARIABLE -> this register contains a variable, might be freed as soon as variable is not be used anymore ( auto freeing is not implemented yet )
 * MANUAL -> this register is manually allocated and wont be freed automatically
 */
export type RegisterUsage = "FREE" | "LITERAL" | "VARIABLE" | "MANUAL";
