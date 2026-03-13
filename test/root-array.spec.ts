import * as assert from "node:assert";
import { describe, it } from "node:test";
import { removeWhiteSpace } from "./util/index.js";
import JsonToTS from "../src/index.js";

describe("Root array type", function() {
  it("should throw error on unsupprted array types", function() {
    const unsupportedArrays = [
      ["sample string", "sample string2"],
      [42, 32],
      [true, false],
      [null, null],
      [42, "sample string"],
      [42, { marius: "marius" }],
      []
    ];

    const expectedMessage = "Only Objects and Array of Objects are supported";

    unsupportedArrays.forEach(arr => {
      try {
        JsonToTS(arr);
        assert.fail("error should be thrown");
      } catch (e: any) {
        assert.strictEqual(e.message, expectedMessage);
      }
    });
  });

  it("should handle array with single object [object]", function() {
    const json = [{ marius: "marius" }];

    const expectedTypes = [
      `interface Main {
        marius: string;
      }`
    ].map(removeWhiteSpace);

    const interfaces = JsonToTS(json);

    interfaces.forEach(i => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert.ok(expectedTypes.includes(noWhiteSpaceInterface));
    });
    assert.strictEqual(interfaces.length, 1);
  });

  it("should handle array with multiple same objects [object, object]", function() {
    const json = [{ marius: "marius" }, { marius: "marius" }];

    const expectedTypes = [
      `interface Main {
        marius: string;
      }`
    ].map(removeWhiteSpace);

    const interfaces = JsonToTS(json);

    interfaces.forEach(i => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert.ok(expectedTypes.includes(noWhiteSpaceInterface));
    });
    assert.strictEqual(interfaces.length, 1);
  });

  it("should handle array with multiple different objects [object1, object2]", function() {
    const json = [{ marius: "marius" }, { darius: "darius" }];

    const expectedTypes = [
      `interface Main {
        marius?: string;
        darius?: string;
      }`
    ].map(removeWhiteSpace);

    const interfaces = JsonToTS(json);

    interfaces.forEach(i => {
      const noWhiteSpaceInterface = removeWhiteSpace(i);
      assert.ok(expectedTypes.includes(noWhiteSpaceInterface));
    });
    assert.strictEqual(interfaces.length, 1);
  });
});
