import { describe, expect, it } from "vitest";
import { en } from "./en";
import { fill, messages } from "./index";
import { ko } from "./ko";

function sameShape(left: unknown, right: unknown): boolean {
  if (typeof left !== "object" || left === null || typeof right !== "object" || right === null) {
    return typeof left === typeof right;
  }

  const leftKeys = Object.keys(left);
  const rightRecord = right as Record<string, unknown>;
  return (
    leftKeys.length === Object.keys(right).length &&
    leftKeys.every((key) => key in rightRecord && sameShape((left as Record<string, unknown>)[key], rightRecord[key]))
  );
}

describe("messages", () => {
  it("keeps the same keys in English and Korean", () => {
    expect(sameShape(en, ko)).toBe(true);
    expect(messages.en).toBe(en);
    expect(messages.ko).toBe(ko);
  });

  it("fills placeholders and leaves unknown values empty", () => {
    expect(fill(ko.jsonFormatter.invalid, { line: 1, column: 8 })).toBe("1행 8열을 확인하세요.");
    expect(fill("Hello {name}", {})).toBe("Hello ");
  });
});
