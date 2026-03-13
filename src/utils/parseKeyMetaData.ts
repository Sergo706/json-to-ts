import { KeyMetaData } from "../types/keyMeta.js";

export function parseKeyMetaData(key: string): KeyMetaData {
  const isOptional = key.endsWith("--?");

  if (isOptional) {
    return {
      isOptional,
      keyValue: key.slice(0, -3)
    };
  } else {
    return {
      isOptional,
      keyValue: key
    };
  }
}