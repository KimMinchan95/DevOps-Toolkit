import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { usePreferencesStore } from "./stores/preferences";
import App from "./App";

describe("App", () => {
  it("moves between home and the JSON formatter and follows the language", async () => {
    const user = userEvent.setup();
    usePreferencesStore.setState({ language: "ko" });
    window.history.pushState(null, "", "/");
    render(<App />);

    await user.click(screen.getByRole("link", { name: "JSON Formatter 열기" }));
    expect(screen.getByRole("button", { name: "정리" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/json-formatter");

    await user.click(screen.getByRole("link", { name: "DevOps Toolkit 홈" }));
    expect(screen.getByRole("link", { name: "JSON Formatter 열기" })).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "언어" }), "en");
    expect(screen.getByRole("link", { name: "Open JSON Formatter" })).toBeInTheDocument();
  });

  it("opens the formatter directly from its address", () => {
    usePreferencesStore.setState({ language: "en" });
    window.history.pushState(null, "", "/json-formatter");
    render(<App />);

    expect(screen.getByRole("button", { name: "Format" })).toBeInTheDocument();
  });
});
