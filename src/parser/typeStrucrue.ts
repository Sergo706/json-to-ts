import { TypeDescription, TypeGroup, TypeStructure } from "../types/typeStructure.js";
import { Options as ParserOptions } from "../types/options.js";
import { getTypeDescriptionGroup } from "../utils/getTypeDescriptionGroup.js";
import { onlyUnique, isHash } from "../utils/utlls.js";
import { MergeTypeStructure } from "./merger.js";

export class TypeStructureParser extends MergeTypeStructure {

  private readonly rootName: string;
  private readonly useTypeAlias: boolean;
  private readonly useLiteralTypes: boolean | string[];

  constructor(options: ParserOptions = {}) {
    super();
    this.rootName = options.rootName ?? "Main";
    this.useTypeAlias = options.useTypeAlias ?? false;
    this.useLiteralTypes = options.useLiteralTypes ?? false;
  }


  public parse(json: unknown): TypeStructure {
    this.discoveredTypes = [];
    const rootId = this.getTypeStructure(json);
    
    const structure: TypeStructure = {
      rootTypeId: rootId,
      types: this.discoveredTypes,
    };

    this.optimizeTypeStructure(structure);
    return structure;
  }

  private createTypeObject(obj: Record<string, unknown>): Record<string, string> {
    return Object.entries(obj).reduce((typeObj: Record<string, string>, [key, value]) => {
      const rootTypeId = this.getTypeStructure(value, key);

      return {
        ...typeObj,
        [key]: rootTypeId,
      };
    }, {});
  }

  private getAllUsedTypeIds({ rootTypeId, types }: TypeStructure): string[] {
    const typeDesc: TypeDescription | undefined = types.find((_) => _.id === rootTypeId);

    if (!typeDesc) {
      return [];
    }

    const subTypes = (desc: TypeDescription): string[] => {
      switch (getTypeDescriptionGroup(desc)) {
        case TypeGroup.Array:
          const arrSubTypes = (desc.arrayOfTypes ?? [])
            .filter(isHash)
            .map((typeId) => {
              const childDesc = types.find((_) => _.id === typeId);
              return childDesc ? subTypes(childDesc) : [];
            })
            .reduce((a, b) => [...a, ...b], []);
          return [desc.id, ...arrSubTypes];

        case TypeGroup.Object:
          const objSubTypes = Object.values(desc.typeObj ?? {})
            .filter(isHash)
            .map((typeId) => {
              const childDesc = types.find((_) => _.id === typeId);
              return childDesc ? subTypes(childDesc) : [];
            })
            .reduce((a, b) => [...a, ...b], []);
          return [desc.id, ...objSubTypes];

        default:
          return [desc.id];
      }
    };

    return subTypes(typeDesc);
  }


  protected getTypeStructure(targetObj: unknown, key?: string): string {
    switch (this.getTypeGroup(targetObj)) {
      case TypeGroup.Array: {
        const targetArray = targetObj as unknown[];
        const typesOfArray = targetArray.map((_) => this.getTypeStructure(_, key)).filter(onlyUnique);
        const arrayInnerTypeId = this.getInnerArrayType(typesOfArray);
        return this.getIdByType([arrayInnerTypeId]);
      }

      case TypeGroup.Object: {
        const targetRecord = targetObj as Record<string, unknown>;
        const typeObj = this.createTypeObject(targetRecord);
        return this.getIdByType(typeObj);
      }

      case TypeGroup.Primitive: {
        const shouldBeLiteral =
          this.useLiteralTypes === true ||
          (Array.isArray(this.useLiteralTypes) && key && this.useLiteralTypes.includes(key));

        return shouldBeLiteral ? this.getLiteralTypeName(targetObj) : this.getSimpleTypeName(targetObj);
      }

      case TypeGroup.Date:
        return this.getSimpleTypeName(targetObj);

      default:
        return "unknown";
    }
  }

  public optimizeTypeStructure(typeStructure: TypeStructure): void {
    const usedTypeIds = this.getAllUsedTypeIds(typeStructure);

    const optimizedTypes = typeStructure.types.filter((typeDesc) => usedTypeIds.includes(typeDesc.id));

    typeStructure.types = optimizedTypes;
  }

}