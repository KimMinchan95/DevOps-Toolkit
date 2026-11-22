import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePreferencesStore } from "../stores/preferences";
import { useResolvedLocale } from "./use-resolved-locale";

function setNavigatorLanguage(language: string) {
  Object.defineProperty(navigator, "language", { configurable: true, value: language });
}

describe("useResolvedLocale", () => {
  it("follows an explicit language and a system language change", () => {
    setNavigatorLanguage("ko-KR");
    usePreferencesStore.setState({ language: "system" });
    const { result } = renderHook(() => useResolvedLocale());

    expect(result.current).toBe("ko");

    act(() => usePreferencesStore.getState().setLanguage("en"));
    expect(result.current).toBe("en");

    act(() => {
      usePreferencesStore.getState().setLanguage("system");
      setNavigatorLanguage("en-US");
      window.dispatchEvent(new Event("languagechange"));
    });

    expect(result.current).toBe("en");
  });
});
