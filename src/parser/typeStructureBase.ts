import { isObject} from "../utils/utlls.js";
import { TypeDescription, TypeGroup, TypeInput } from "../types/typeStructure.js";



export abstract class TypeStructureParserBase {
    protected discoveredTypes: TypeDescription[] = [];

    private generateId(): string {
        return crypto.randomUUID();
    }


    private createTypeDescription(typeObj: TypeInput, isUnion: boolean): TypeDescription {
            if (Array.isArray(typeObj)) {
                return {
                    id: this.generateId(),
                    arrayOfTypes: typeObj,
                    isUnion,
                };
                
            } else {
                return {
                    id: this.generateId(),
                    typeObj,
                };
            }
    }


    private arraysContainSameElements(arr1: unknown[] | undefined, arr2: unknown[] | undefined): boolean {
            if (arr1 === undefined || arr2 === undefined) return false;
            return arr1.sort().join("") === arr2.sort().join("");
    }

    private objectsHaveSameEntries(obj1: Record<string, string> | undefined, obj2: Record<string, string> | undefined): boolean {
            if (obj1 === undefined || obj2 === undefined) return false;

            const entries1 = Object.entries(obj1);
            const entries2 = Object.entries(obj2);

            const sameLength = entries1.length === entries2.length;

            const sameTypes = entries1.every(([key, value]) => {
                return obj2[key] === value;
            });

            return sameLength && sameTypes;
    }


    private typeObjectMatchesTypeDesc(typeObj: TypeInput, typeDesc: TypeDescription, isUnion: boolean): boolean {
        if (Array.isArray(typeObj)) {
            return this.arraysContainSameElements(typeObj, typeDesc.arrayOfTypes) && typeDesc.isUnion === isUnion;
        } else {
            return this.objectsHaveSameEntries(typeObj, typeDesc.typeObj);
        }
    }

    protected getIdByType(typeObj: TypeInput, isUnion = false): string {
        let typeDesc = this.discoveredTypes.find((el) => {
            return this.typeObjectMatchesTypeDesc(typeObj, el, isUnion);
        });

        if (!typeDesc) {
            typeDesc = this.createTypeDescription(typeObj, isUnion);
            this.discoveredTypes.push(typeDesc);
        }

        return typeDesc.id;
    }

    protected getSimpleTypeName(value: unknown): string {
            if (value === null) {
                return "null";
            } else if (value instanceof Date) {
                return "Date";
            } else {
                return typeof value;
            }
    }

    protected getLiteralTypeName(value: unknown): string {
        return JSON.stringify(value);
    }

    protected getTypeGroup(value: unknown): TypeGroup {
        if (value instanceof Date) {
            return TypeGroup.Date;
        } else if (Array.isArray(value)) {
            return TypeGroup.Array;
        } else if (isObject(value)) {
            return TypeGroup.Object;
        } else {
            return TypeGroup.Primitive;
        }
    }

    protected toOptionalKey(key: string): string {
        return key.endsWith("--?") ? key : `${key}--?`;
    }
}