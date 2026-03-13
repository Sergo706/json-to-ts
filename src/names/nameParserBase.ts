import { parseKeyMetaData } from "../utils/parseKeyMetaData.js";

export abstract class NameParserBase {

  constructor(protected readonly singularizeStrategy?: (name: string) => string) {}

  protected capitalize(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  protected pascalCase(name: string): string {
    return name
      .split(/\s+/g)
      .filter((_) => _ !== "")
      .map((s) => this.capitalize(s))
      .reduce((a, b) => a + b, "");
  }

  protected normalizeInvalidTypeName(name: string): string {
    if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(name)) {
      return name;
    } else {
      const noSymbolsName = name.replace(/[^a-zA-Z0-9]/g, "");
      const startsWithWordCharacter = /^[a-zA-Z]/.test(noSymbolsName);
      return startsWithWordCharacter ? noSymbolsName : `_${noSymbolsName}`;
    }
  }

  /**
   * Simple internal singularization logic to avoid external dependencies.
   * Covers basic cases: 'categories' -> 'category', 'users' -> 'user'.
   */
  protected defaultSingularize(name: string): string {
    if (name.endsWith("ies")) {
      return name.slice(0, -3) + "y";
    }
    if (name.endsWith("s") && !name.endsWith("ss")) {
      return name.slice(0, -1);
    }
    return name;
  }

  protected getSingularName(name: string): string {
    return this.singularizeStrategy ? this.singularizeStrategy(name) : this.defaultSingularize(name);
  }

  protected getBaseName(key: string, isInsideArray: boolean): string {
    const { keyValue } = parseKeyMetaData(key);
    const normalized = isInsideArray ? this.getSingularName(keyValue) : keyValue;
    
    return this.pascalCase(this.normalizeInvalidTypeName(this.pascalCase(normalized)));
  }
}
