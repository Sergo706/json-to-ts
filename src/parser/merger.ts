import { TypeDescription, TypeGroup } from "../types/typeStructure.js";
import { getTypeDescriptionGroup } from "../utils/getTypeDescriptionGroup.js";
import { findTypeById, onlyUnique } from "../utils/utlls.js";
import { TypeStructureParserBase } from "./typeStructureBase.js";

export class MergeTypeStructure extends TypeStructureParserBase {

  protected getMergedObjects(typesOfArray: TypeDescription[]): string {
    const typeObjects = typesOfArray.map((typeDesc) => typeDesc.typeObj ?? {});

    const allKeys = typeObjects
      .map((typeObj) => Object.keys(typeObj))
      .reduce((a, b) => [...a, ...b], [])
      .filter(onlyUnique);

    const commonKeys = typeObjects.reduce((common: string[], typeObj) => {
      const keys = Object.keys(typeObj);
      return common.filter((key) => keys.includes(key));
    }, allKeys);

    const getKeyType = (key: string): string => {
      const typesOfKey = typeObjects
        .filter((typeObj) => Object.prototype.hasOwnProperty.call(typeObj, key))
        .map((typeObj) => typeObj[key])
        .filter(onlyUnique);

      if (typesOfKey.length === 1) {
        return typesOfKey[0];
      } else {
        return this.getInnerArrayType(typesOfKey);
      }
    };

    const mergedObj = allKeys.reduce((obj: Record<string, string>, key: string) => {
      const isMandatory = commonKeys.includes(key);
      const type = getKeyType(key);
      const keyValue = isMandatory ? key : this.toOptionalKey(key);

      return {
        ...obj,
        [keyValue]: type,
      };
    }, {});

    return this.getIdByType(mergedObj, true);
  }

  protected getMergedArrays(typesOfArray: TypeDescription[]): string {
    const idsOfArrayTypes = typesOfArray
      .map((typeDesc) => typeDesc.arrayOfTypes ?? [])
      .reduce((a, b) => [...a, ...b], [])
      .filter(onlyUnique);

    if (idsOfArrayTypes.length === 1) {
      return this.getIdByType([idsOfArrayTypes[0]]);
    } else {
      return this.getIdByType([this.getInnerArrayType(idsOfArrayTypes)]);
    }
  }

  protected getInnerArrayType(typesOfArray: string[]): string {
    const containsUndefined = typesOfArray.includes("undefined");
    const arrayTypesDescriptions = typesOfArray.map((id) => findTypeById(id, this.discoveredTypes)).filter((desc): desc is TypeDescription => !!desc);

    const allArrayType =
      arrayTypesDescriptions.filter((typeDesc) => getTypeDescriptionGroup(typeDesc) === TypeGroup.Array).length ===
      typesOfArray.length;

    const allArrayTypeWithUndefined =
      arrayTypesDescriptions.filter((typeDesc) => getTypeDescriptionGroup(typeDesc) === TypeGroup.Array).length + 1 ===
      typesOfArray.length && containsUndefined;

    const allObjectTypeWithUndefined =
      arrayTypesDescriptions.filter((typeDesc) => getTypeDescriptionGroup(typeDesc) === TypeGroup.Object).length + 1 ===
      typesOfArray.length && containsUndefined;

    const allObjectType =
      arrayTypesDescriptions.filter((typeDesc) => getTypeDescriptionGroup(typeDesc) === TypeGroup.Object).length ===
      typesOfArray.length;

    if (typesOfArray.length === 0) {
      return this.getIdByType([], true);
    }

    if (typesOfArray.length === 1) {
      return typesOfArray[0];
    }

    if (typesOfArray.length > 1) {
      if (allObjectType) return this.getMergedObjects(arrayTypesDescriptions);
      if (allArrayType) return this.getMergedArrays(arrayTypesDescriptions);

      if (allArrayTypeWithUndefined) {
        return this.getMergedUnion([this.getMergedArrays(arrayTypesDescriptions), "undefined"]);
      }

      if (allObjectTypeWithUndefined) {
        return this.getMergedUnion([this.getMergedObjects(arrayTypesDescriptions), "undefined"]);
      }

      return this.getMergedUnion(typesOfArray);
    }

    return "any";
  }

  protected getMergedUnion(typesOfArray: string[]): string {
    const innerUnionsTypes = typesOfArray
      .map((id) => findTypeById(id, this.discoveredTypes))
      .filter((desc): desc is TypeDescription => !!desc && !!desc.isUnion)
      .map((desc) => desc.arrayOfTypes ?? [])
      .reduce((a, b) => [...a, ...b], []);

    const primitiveTypes = typesOfArray.filter((id) => !findTypeById(id, this.discoveredTypes)?.isUnion);

    return this.getIdByType([...innerUnionsTypes, ...primitiveTypes], true);
  }

}