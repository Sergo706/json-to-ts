import { TypeDescription, TypeGroup } from "../types/typeStructure.js";

export function getTypeDescriptionGroup(desc: TypeDescription | undefined): TypeGroup {
  if (desc === undefined) {
    return TypeGroup.Primitive;
  } else if (desc.arrayOfTypes !== undefined) {
    return TypeGroup.Array;
  } else {
    return TypeGroup.Object;
  }
}