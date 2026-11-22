import { describe, expect, it } from "vitest";
import { formatJson, minifyJson, toolIds } from "./index";

describe("formatJson", () => {
  it("indents objects and keeps key order", () => {
    expect(formatJson('{"b":1,"a":[true,null]}')).toEqual({
      ok: true,
      text: '{\n  "b": 1,\n  "a": [\n    true,\n    null\n  ]\n}',
    });
  });

  it("rejects blank input", () => {
    expect(formatJson(" \n")).toEqual({ ok: false, reason: "empty", line: 1, column: 1 });
  });

  it("points at the broken token", () => {
    expect(formatJson('{\n  "a": 1,\n}')).toEqual({ ok: false, reason: "invalid", line: 3, column: 1 });
  });
});

describe("minifyJson", () => {
  it("removes insignificant whitespace", () => {
    const formatted = formatJson('{"b":1,"a":[true,null]}');
    if (!formatted.ok) throw new Error("fixture should format");

    expect(minifyJson(formatted.text)).toEqual({ ok: true, text: '{"b":1,"a":[true,null]}' });
  });

  it("rejects blank input", () => {
    expect(minifyJson("")).toEqual({ ok: false, reason: "empty", line: 1, column: 1 });
  });
});

describe("toolIds", () => {
  it("lists the toolkit tools", () => {
    expect(toolIds).toEqual(["json-formatter", "unix-timestamp", "uuid-generator"]);
  });
});
