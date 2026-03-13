import * as assert from "node:assert";
import { describe, it } from "node:test";
import { removeWhiteSpace } from "./util/index";
import JsonToTS from "../src/index";

describe("Single interface", function () {
  it("should work with empty objects", function () {
    const json = {};

    const expected = `
      interface Main {
      }
    `;
    const actual = JsonToTS(json).pop()!;
    const [a, b] = [expected, actual].map(removeWhiteSpace);
    assert.strictEqual(a, b);
  });

  it("should not quote underscore key names", function () {
    const json = {
      _marius: "marius",
    };

    const expected = `
      interface Main {
        _marius: string;
      }
    `;
    const actual = JsonToTS(json).pop()!;
    const [a, b] = [expected, actual].map(removeWhiteSpace);
    assert.strictEqual(a, b);
  });

  it("should convert Date to Date type", function () {
    const json = {
      _marius: new Date(),
    };

    const expected = `
      interface Main {
        _marius: Date;
      }
    `;
    const actual = JsonToTS(json).pop()!;
    const [a, b] = [expected, actual].map(removeWhiteSpace);
    assert.strictEqual(a, b);
  });

  it("should handle empty string as key", function () {
    const json = {
      "": "",
    };

    const expected = `
      interface Main {
        '': string;
      }
    `;
    const actual = JsonToTS(json).pop()!;
    const [a, b] = [expected, actual].map(removeWhiteSpace);
    assert.strictEqual(a, b);
  });

  it("should work with multiple key words", function () {
    const json = {
      "hello world": 42,
    };

    const expected = `
interface Main {
  'hello world': number;
}`;
    const actual = JsonToTS(json).pop()!;
    assert.strictEqual(expected.trim(), actual.trim());
  });

  it("should work with multiple key words and optional fields", function () {
    const json = {
      "hello world": undefined,
    };

    const expected = `
interface Main {
  'hello world'?: any;
}`;
    const actual = JsonToTS(json).pop()!;
    assert.strictEqual(expected.trim(), actual.trim());
  });

  it("should work with primitive types", function () {
    const json = {
      str: "this is string",
      num: 42,
      bool: true,
    };

    const expected = `
      interface Main {
        str: string;
        num: number;
        bool: boolean;
      }
    `;
    const interfaceStr = JsonToTS(json).pop()!;
    const [expect, actual] = [expected, interfaceStr].map(removeWhiteSpace);
    assert.strictEqual(expect, actual);
  });

  it("should keep field order", function () {
    const json = {
      c: "this is string",
      a: 42,
      b: true,
    };

    const expected = `
      interface Main {
        c: string;
        a: number;
        b: boolean;
      }
    `;
    const interfaceStr = JsonToTS(json).pop()!;
    const [expect, actual] = [expected, interfaceStr].map(removeWhiteSpace);
    assert.strictEqual(expect, actual);
  });

  it("should add optional field modifier on null values", function () {
    const json = {
      field: undefined,
    };

    const expected = `
      interface Main {
        field?: any;
      }
    `;
    const actual = JsonToTS(json).pop()!;
    const [a, b] = [expected, actual].map(removeWhiteSpace);
    assert.strictEqual(a, b);
  });

  it('should name root object interface "Main"', function () {
    const json = {};

    const expected = `
      interface Main {
      }
    `;
    const actual = JsonToTS(json).pop()!;
    const [a, b] = [expected, actual].map(removeWhiteSpace);
    assert.strictEqual(a, b);
  });

  it("should empty array should be any[]", function () {
    const json = {
      arr: [],
    };

    const expected = `
      interface Main {
        arr: any[];
      }
    `;
    const actual = JsonToTS(json).pop()!;
    const [a, b] = [expected, actual].map(removeWhiteSpace);
    assert.strictEqual(a, b);
  });
});
