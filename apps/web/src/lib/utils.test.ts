import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("keeps the later Tailwind class when two utilities conflict", () => {
    expect(cn("px-2", "px-4", false && "hidden")).toBe("px-4");
  });
});
