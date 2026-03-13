export interface NameEntry {
  id: string;
  name: string;
}

export interface NameStructure {
  rootName: string;
  names: NameEntry[];
}