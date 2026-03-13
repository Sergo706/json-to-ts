export enum TypeGroup {
  Primitive,
  Array,
  Object,
  Date,
}

export type TypeInput = Record<string, string> | string[];

export interface TypeDescription {
  id: string;
  isUnion?: boolean;
  typeObj?: Record<string, string>;
  arrayOfTypes?: string[];
}

export interface TypeStructure {
  rootTypeId: string;
  types: TypeDescription[];
}

export interface InterfaceDescription {
  name: string;
  typeMap: Record<string, string>;
}
