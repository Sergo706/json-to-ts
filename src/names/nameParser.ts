import { NameEntry } from "../types/nameStructure.js";
import { TypeDescription, TypeGroup, TypeStructure } from "../types/typeStructure.js";
import { Options as ParserOptions } from "../types/options.js";
import { findTypeById, isHash } from "../utils/utlls.js";
import { getTypeDescriptionGroup } from "../utils/getTypeDescriptionGroup.js";
import { NameParserBase } from "./nameParserBase.js";

export class NameParser extends NameParserBase {
  private readonly rootName: string;
  private readonly nameMap: NameEntry[] = [];
  private readonly usedNames = new Set<string>();
  private readonly nameConflictTracker = new Map<string, number>();

  constructor(private readonly typeStructure: TypeStructure, options: ParserOptions = {}) {
    super(options.singularize);
    this.rootName = options.rootName ?? "Main";
  }

  public parse(): NameEntry[] {
    this.nameMap.length = 0;
    this.usedNames.clear();
    this.nameConflictTracker.clear();

    this.getName(this.typeStructure.rootTypeId, this.rootName, false);

    return this.nameMap.reverse();
  }

  private getName(rootTypeId: string, keyName: string, isInsideArray: boolean): void {
    const typeDesc = findTypeById(rootTypeId, this.typeStructure.types);

    if (!typeDesc) return;

    switch (getTypeDescriptionGroup(typeDesc)) {
      case TypeGroup.Array:
        (typeDesc.arrayOfTypes ?? []).forEach((typeIdOrPrimitive: string, i: number) => {
          this.getName(
            typeIdOrPrimitive,
            i === 0 ? keyName : `${keyName}${String(i + 1)}`,
            true
          );
        });
        this.getNameById(typeDesc.id, keyName, isInsideArray);
        break;

      case TypeGroup.Object:
        if (typeDesc.typeObj) {
          Object.entries(typeDesc.typeObj).forEach(([key, value]) => {
            this.getName(value, key, false);
          });
        }
        this.getNameById(typeDesc.id, keyName, isInsideArray);
        break;
    }
  }

  private getNameById(id: string, keyName: string, isInsideArray: boolean): string {
    const existing = this.nameMap.find((_) => _.id === id);
    if (existing) return existing.name;

    const typeDesc = findTypeById(id, this.typeStructure.types);
    if (!typeDesc) return id;

    const group = getTypeDescriptionGroup(typeDesc);
    let name = "";

    switch (group) {
      case TypeGroup.Array:
        name = typeDesc.isUnion ? this.getUnionName(typeDesc) : this.getArrayName(typeDesc);
        break;

      case TypeGroup.Object:
        const baseName = this.getBaseName(keyName, isInsideArray);
        name = this.getUniqueName(baseName);
        break;
    }

    this.nameMap.push({ id, name });
    return name;
  }

  private getUniqueName(baseName: string): string {
    if (!this.usedNames.has(baseName)) {
      this.usedNames.add(baseName);
      return baseName;
    }

    const count = (this.nameConflictTracker.get(baseName) ?? 1) + 1;
    this.nameConflictTracker.set(baseName, count);
    
    const proposal = `${baseName}${String(count)}`;
    return this.getUniqueName(proposal);
  }

  private getArrayName(typeDesc: TypeDescription): string {
    const innerTypeId = (typeDesc.arrayOfTypes ?? [])[0];
    const isMultipleTypeArray =
      isHash(innerTypeId) &&
      (() => {
        const innerDesc = findTypeById(innerTypeId, this.typeStructure.types);
        return !!(innerDesc?.isUnion && (innerDesc.arrayOfTypes?.length ?? 0) > 1);
      })();

    const readableInnerType = this.getUnionName(typeDesc);

    return isMultipleTypeArray ? `(${readableInnerType})[]` : `${readableInnerType}[]`;
  }

  private getUnionName(typeDesc: TypeDescription): string {
    const types = typeDesc.arrayOfTypes ?? [];
    if (types.length === 0) return "any";
    
    return types
      .map((id) => {
        if (!isHash(id)) return id;
        // Recursive name lookups for union members should treat them as array elements
        return this.getNameById(id, "element", true);
      })
      .filter(onlyUnique)
      .join(" | ");
  }
}

function onlyUnique(value: string, index: number, self: string[]) {
  return self.indexOf(value) === index;
}
