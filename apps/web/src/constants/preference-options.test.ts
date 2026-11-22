import { describe, expect, it } from "vitest";
import { messages } from "../locales";
import { languageOptions, themeOptions } from "./preference-options";

describe("preference options", () => {
  it("uses labels that exist in both languages", () => {
    for (const option of [...themeOptions, ...languageOptions]) {
      expect(option.label in messages.en.shell).toBe(true);
      expect(option.label in messages.ko.shell).toBe(true);
    }
  });

  it("lists each theme and language once", () => {
    expect(themeOptions.map((option) => option.value)).toEqual(["system", "light", "dark"]);
    expect(languageOptions.map((option) => option.value)).toEqual(["system", "ko", "en"]);
  });
});
