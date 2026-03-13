export interface Options {
  rootName?: string;
  useTypeAlias?: boolean;
  singularize?: (name: string) => string;
  useLiteralTypes?: boolean | string[];
}