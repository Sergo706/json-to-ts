import { KeyMetaData } from "../types/keyMeta.js";
import { TypeInput } from "../types/typeStructure.js";
import { NameEntry } from "../types/nameStructure.js";

import { isHash, isNonArrayUnion } from "../utils/utlls.js";

export abstract class InterfaceParserBase {

    constructor(protected readonly names: NameEntry[]) {}

    private isKeyNameValid(keyName: string): boolean {
        const regex = /^[a-zA-Z_][a-zA-Z\d_]*$/;
        return regex.test(keyName);
    }

    private parseKeyMetaData(key: string): KeyMetaData {
        const isOptional = key.endsWith("--?");

        if (isOptional) {
            return {
                isOptional,
                keyValue: key.slice(0, -3),
            };
        } else {
            return {
                isOptional,
                keyValue: key,
            };
        }
    }

    private removeUndefinedFromUnion(unionTypeName: string): string {
        const typeNames = unionTypeName.split(" | ");
        const undefinedIndex = typeNames.indexOf("undefined");
        if (undefinedIndex !== -1) {
            typeNames.splice(undefinedIndex, 1);
        }
        return typeNames.join(" | ");
    }

    protected findNameById(id: string): string {
        const nameEntry = this.names.find((_) => _.id === id);
        return nameEntry ? nameEntry.name : id;
    }

    protected replaceTypeObjIdsWithNames(typeObj: TypeInput): Record<string, string> {
        // Interface mapping only makes sense for object-like TypeInput (Record<string, string>)
        const obj = Array.isArray(typeObj) ? {} : typeObj;

        return Object.entries(obj)
            // quote key if is invalid and question mark if optional from array merging
            .map(([key, type]): [string, string, boolean] => {
                const { isOptional, keyValue } = this.parseKeyMetaData(key);
                const isValid = this.isKeyNameValid(keyValue);

                const validName = isValid ? keyValue : `'${keyValue}'`;

                return isOptional ? [`${validName}?`, type, isOptional] : [validName, type, isOptional];
            })
            // replace hashes with names referencing the hashes
            .map(([key, type, isOptional]): [string, string, boolean] => {
                if (!isHash(type)) {
                    return [key, type, isOptional];
                }

                const newType = this.findNameById(type);
                return [key, newType, isOptional];
            })
            // if union has undefined, remove undefined and make type optional
            .map(([key, type, isOptional]): [string, string, boolean] => {
                if (!(isNonArrayUnion(type) && type.includes("undefined"))) {
                    return [key, type, isOptional];
                }

                const newType = this.removeUndefinedFromUnion(type);
                const newKey = isOptional ? key : `${key}?`; // if already optional dont add question mark
                return [newKey, newType, isOptional];
            })
            // make undefined optional and set type as any
            .map(([key, type, isOptional]): [string, string, boolean] => {
                if (type !== "undefined") {
                    return [key, type, isOptional];
                }

                const newType = "any";
                const newKey = isOptional ? key : `${key}?`; // if already optional dont add question mark
                return [newKey, newType, isOptional];
            })
            .reduce((agg: Record<string, string>, [key, value]) => {
                agg[key] = value;
                return agg;
            }, {});
    }
}