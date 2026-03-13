import { TypeStructure, InterfaceDescription } from "./types/typeStructure.js";
import { Options } from "./types/options.js";
import { NameEntry } from "./types/nameStructure.js";
import { TypeStructureParser } from "./parser/typeStrucrue.js";
import { NameParser } from "./names/nameParser.js";
import { InterfaceParser } from "./interface/interfaceParser.js";
import { validateInput } from "./utils/validateInput.js";

/**
 * Converts a JSON object or an array of objects into a list of TypeScript interface strings.
 * 
 * @param json - The JSON input to parse (must be an object or array of objects).
 * @param userOptions - Configuration options for naming and generation.
 * @returns An array of generated TypeScript interface/type strings.
 */
export default function JsonToTS(json: unknown, userOptions?: Options): string[] {
  const options: Options = {
    rootName: "Main",
    ...userOptions,
  };

  validateInput(json);

  const typeParser = new TypeStructureParser(options);
  const typeStructure: TypeStructure = typeParser.parse(json);

  const nameParser = new NameParser(typeStructure, options);
  const names: NameEntry[] = nameParser.parse();


  const interfaceParser = new InterfaceParser(names, options);
  const descriptions: InterfaceDescription[] = interfaceParser.getInterfaceDescriptions(typeStructure);

  return descriptions.map((desc) => 
    interfaceParser.getInterfaceStringFromDescription(desc)
  );
}