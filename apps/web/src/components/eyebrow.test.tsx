import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Eyebrow } from "./eyebrow";

describe("Eyebrow", () => {
  it("shows its label", () => {
    render(<Eyebrow>LOCAL JSON TOOL</Eyebrow>);

    expect(screen.getByText("LOCAL JSON TOOL")).toBeInTheDocument();
  });
});
