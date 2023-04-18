export const dataTypeList = ["uint16", "void"] as const;

export type DataType = typeof dataTypeList[number];
