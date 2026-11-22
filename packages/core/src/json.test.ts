import { describe, expect, it } from "vitest";
import { formatJson, minifyJson, offsetAt, toolIds } from "./index";

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
    const input = '{\n  "a": 1,\n}';
    expect(formatJson(input)).toEqual({
      ok: false,
      reason: "invalid",
      line: 3,
      column: 1,
      errors: [{ line: 3, column: 1 }],
    });
    expect(input[offsetAt(input, 3, 1)]).toBe("}");
    expect(offsetAt('{"a":1,}', 1, 8)).toBe(7);
  });

  it("points at an unquoted value instead of the first character", () => {
    const input = [
      "{",
      '  "이름 공간(키)": "값",',
      '  "이스케이프": "키나 값에서 큰따옴표를 쓰고 싶으면 \\"처럼 붙입니다.",',
      '  "객체값": { "값 1": 3.141592653589793, "값 2": false, "값 3": null },',
      '  "배열값": ["배열", { "현재값의 인덱스": 1 }, ["안", "배열"]],',
      '  "한 줄 객체": {',
      '    "도로시": 오즈로 돌아가고 싶어요",',
      '    "허수아비": "똑똑해지고 싶어요"',
      "  }",
      "}",
    ].join("\n");
    const result = formatJson(input);
    expect(result.ok).toBe(false);
    if (result.ok) return;

    const offset = offsetAt(input, result.line, result.column);
    expect(input[offset]).toBe("오");
    expect(result.line).toBe(7);
    expect(result.reason === "invalid" && result.errors).toHaveLength(1);
  });

  it("stops at an unclosed quote instead of marking the following lines", () => {
    const input = [
      "{",
      '  "한 줄 객체": { "사자": "용기를 갖고 싶어요" },',
      '  "한 줄 배열: [',
      '    "나무위키는",',
      '    "누구나",',
      '    "위키입니다."',
      "  ]",
      "}",
    ].join("\n");
    const result = formatJson(input);
    expect(result.ok).toBe(false);
    if (result.ok || result.reason !== "invalid") return;

    expect(result.errors).toEqual([{ line: 3, column: 13 }]);
    expect(input[offsetAt(input, 3, 13)]).toBe("\n");
  });

  it("collects broken values on later lines", () => {
    const input = '{\n  "a": 오즈,\n  "b": 진짜\n}';
    const result = formatJson(input);
    expect(result.ok).toBe(false);
    if (result.ok || result.reason !== "invalid") return;

    expect(result.errors.map((issue) => input[offsetAt(input, issue.line, issue.column)])).toEqual(["오", "진"]);
    expect(result.errors.map((issue) => issue.line)).toEqual([2, 3]);
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
