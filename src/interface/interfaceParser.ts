import { InterfaceParserBase } from "./interfaceBase.js";
import { TypeStructure, InterfaceDescription } from "../types/typeStructure.js";
import { Options as ParserOptions } from "../types/options.js";
import { NameEntry } from "../types/nameStructure.js";
import { findTypeById } from "../utils/utlls.js";

export class InterfaceParser extends InterfaceParserBase {

    private readonly useTypeAlias: boolean;

    constructor(names: NameEntry[], options: ParserOptions = {}) {
        super(names);
        this.useTypeAlias = options.useTypeAlias ?? false;
    }

    public getInterfaceStringFromDescription({ name, typeMap }: InterfaceDescription): string {
        const stringTypeMap = Object.entries(typeMap)
            .map(([key, name]) => `  ${key}: ${name};\n`)
            .join("");

        const declarationKeyWord = this.useTypeAlias ? "type" : "interface";
        let interfaceString = `${declarationKeyWord} ${name}${this.useTypeAlias ? " =" : ""} {\n`;
        interfaceString += stringTypeMap;
        interfaceString += "}";
        return interfaceString;
    }

    public getInterfaceDescriptions(typeStructure: TypeStructure): InterfaceDescription[] {
        return this.names
            .map(({ id, name }) => {
                const typeDescription = findTypeById(id, typeStructure.types);

                if (typeDescription?.typeObj) {
                    const typeMap = this.replaceTypeObjIdsWithNames(typeDescription.typeObj);
                    return { name, typeMap };
                } else {
                    return null;
                }
            })
            .filter((_): _ is InterfaceDescription => _ !== null);
    }

}

