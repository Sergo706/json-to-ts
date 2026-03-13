import { TypeDescription } from "../types/typeStructure.js";

export function isHash(str: string) {
  return str.length === 40 || str.length === 36;
}

export function onlyUnique(value: unknown, index: number, self: unknown[]) {
  return self.indexOf(value) === index;
}

export function isArray(x: unknown) {
  return Object.prototype.toString.call(x) === "[object Array]";
}

export function isNonArrayUnion(typeName: string) {
  const arrayUnionRegex = /^\(.*\)\[\]$/;

  return typeName.includes(" | ") && !arrayUnionRegex.test(typeName);
}

export function isObject(x: unknown) {
  return Object.prototype.toString.call(x) === "[object Object]" && x !== null;
}

export function isDate(x: unknown) {
  return x instanceof Date;
}


export function findTypeById(id: string, types: TypeDescription[]): TypeDescription | undefined {
  return types.find(_ => _.id === id);
}
