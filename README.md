# Json to TS

## Convert JSON objects into clean, optimized TypeScript interfaces.

>NOTE
>
>This is a fork of [MariusAlch/json-to-ts](https://github.com/MariusAlch/json-to-ts) redesigned with a stateful pipeline architecture, new features, and **zero runtime dependencies**.


---

## Features

  - Literal Type Discovery: Automatically generate string, number, or boolean literals.
  - Merging: Deeply nested arrays of objects are merged into single, optimized interfaces with optional properties.
  - Zero Dependencies.
  - Tree shakable and minified.
  - Ships with both ESM and CJS support out of the box.
  - Fully typed.


## Installation

```bash
npm install @riavzon/json-to-ts
```

---

## Usage

```typescript
import JsonToTS from '@riavzon/json-to-ts';
// or
const JsonToTS = require('@riavzon/json-to-ts');

const json = {
  id: 1,
  name: "John Doe",
  roles: ["admin", "editor"]
};

const interfaces = JsonToTS(json);
interfaces.forEach(i => console.log(i));

```
Output:

```ts
interface Main {
  id: number;
  name: string;
  roles: string[];
}
```

### Literal Types
You can lock down specific fields to their literal values:

```typescript
import JsonToTS from '@riavzon/json-to-ts';


const options = {
  rootName: "ApiResponse",
  useLiteralTypes: ["status", "version"]
};

const json = {
  version: "v1.2",
  status: "success",
  data: {
        id: 1,
        name: "John Doe",
        roles: ["admin", "editor"]
   }
};

const interfaces = JsonToTS(json, options);
interfaces.forEach(i => console.log(i));

```
Output:
```ts
interface ApiResponse {
  version: "v1.2";
  status: "success";
  data: Data;
}
interface Data {
  id: number;
  name: string;
  roles: string[];
}
```

---

## Configuration Options

  | Option | Type | Default | Description |
  | --- | --- | --- | --- |
  | `rootName` | `string` | `"Main"` | The name of the root interface. |
  | `useLiteralTypes` | `boolean \| string[]` | `false` | Enable global or selective literal type generation. |
  | `useTypeAlias` | `boolean` | `false` | Use `type` instead of `interface`. |
  | `singularize` | `(name: string) => string` | `Internal` | Custom strategy for naming array elements. |

---
MIT License
