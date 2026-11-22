import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { usePreferencesStore } from "../stores/preferences";
import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders preference options and stores the selected theme", async () => {
    const user = userEvent.setup();
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.append(meta);
    const navigate = vi.fn();

    render(
      <AppShell locale="ko" navigate={navigate}>
        <p>내용</p>
      </AppShell>,
    );

    expect(screen.getByRole("option", { name: "라이트 모드" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "한국어" })).toBeInTheDocument();
    expect(screen.getByText("내용")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "화면 테마" }), "dark");

    expect(usePreferencesStore.getState().theme).toBe("dark");
    expect(meta).toHaveAttribute("content", "#111315");

    await user.click(screen.getByRole("link", { name: "DevOps Toolkit 홈" }));
    expect(navigate).toHaveBeenCalledWith("/");
  });
});
