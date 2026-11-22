import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HomePage } from "./home-page";

describe("HomePage", () => {
  it("opens the JSON formatter in the selected language", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();

    const { rerender } = render(<HomePage locale="ko" navigate={navigate} />);

    expect(document.title).toBe("DevOps Toolkit");
    await user.click(screen.getByRole("link", { name: "JSON Formatter 열기" }));
    expect(navigate).toHaveBeenCalledWith("/json-formatter");

    rerender(<HomePage locale="en" navigate={navigate} />);
    expect(screen.getByRole("link", { name: "Open JSON Formatter" })).toBeInTheDocument();
  });
});
