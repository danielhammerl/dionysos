export interface Variable {
  identifier: string;
  dataType: 'uint16';
  storedAt: string | null;
}

export type REGISTER_USAGE_TYPE = "FREE" | "LITERAL" | "VARIABLE" | "MANUAL";