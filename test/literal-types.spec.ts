import * as assert from "node:assert";
import { describe, it } from "node:test";
import { removeWhiteSpace } from "./util/index";
import JsonToTS from "../src/index";

describe("Literal types", function () {
  it("should use literal types for all properties", function () {
    const json = {
      str: "The meaning of life",
      nbr: 42,
    };

    const expected = `
      interface Main {
        str: "The meaning of life";
        nbr: 42;
      }
    `;
    const actual = JsonToTS(json, { useLiteralTypes: true }).pop()!;
    const [a, b] = [actual, expected].map(removeWhiteSpace);
    assert.strictEqual(a, b);
  });

  it("should use literal types for selected properties", function () {
    const json = {
      str: "The meaning of life",
      nbr: 42,
      c: "c",
    };

    const expected = `
      interface Main {
        str: "The meaning of life";
        nbr: 42;
        c: string;
      }
    `;

    const actual = JsonToTS(json, { useLiteralTypes: ["str", "nbr"] }).pop()!;
    const [a, b] = [actual, expected].map(removeWhiteSpace);
    assert.strictEqual(a, b);
  });

  it("should work with boolean literals", function () {
    const json = {
      isTrue: true,
      isFalse: false,
    };

    const expected = `
      interface Main {
        isTrue: true;
        isFalse: false;
      }
    `;

    const actual = JsonToTS(json, { useLiteralTypes: true }).pop()!;
    const [a, b] = [actual, expected].map(removeWhiteSpace);
    assert.strictEqual(a, b);
  });

  it("should work with null literals", function () {
    const json = {
      nothing: null,
    };

    const expected = `
      interface Main {
        nothing: null;
      }
    `;

    const actual = JsonToTS(json, { useLiteralTypes: true }).pop()!;
    const [a, b] = [actual, expected].map(removeWhiteSpace);
    assert.strictEqual(a, b);
  });
  
  it("should work within arrays", function () {
    const json = {
      tags: ["news", "tech"]
    };

    const expected = `
      interface Main {
        tags: ("news" | "tech")[];
      }
    `;

    const actual = JsonToTS(json, { useLiteralTypes: true }).pop()!;
    const [a, b] = [actual, expected].map(removeWhiteSpace);
    assert.strictEqual(a, b);
  });
});
