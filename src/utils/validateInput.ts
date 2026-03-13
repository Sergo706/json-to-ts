import { isArray, isObject } from "./utlls.js";

export function validateInput(json: unknown): void {
  const isArrayOfObjects = isArray(json) && 
    (json as unknown[]).length > 0 && 
    (json as unknown[]).every((item) => isObject(item));

  if (!(isObject(json) || isArrayOfObjects)) {
    throw new Error("Only Objects and Array of Objects are supported");
  }
}