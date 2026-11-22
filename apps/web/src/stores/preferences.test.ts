import { beforeEach, describe, expect, it } from "vitest";
import { getSystemLanguage, resolveLanguage, usePreferencesStore } from "./preferences";

function setNavigatorLanguage(language: string) {
  Object.defineProperty(navigator, "language", { configurable: true, value: language });
}

describe("resolveLanguage", () => {
  it("uses the saved language and otherwise the system language", () => {
    expect(resolveLanguage("en", "ko")).toBe("en");
    expect(resolveLanguage("system", "ko")).toBe("ko");
  });
});

describe("getSystemLanguage", () => {
  it("treats Korean locales as Korean", () => {
    setNavigatorLanguage("ko-KR");
    expect(getSystemLanguage()).toBe("ko");
    setNavigatorLanguage("en-US");
    expect(getSystemLanguage()).toBe("en");
  });
});

describe("usePreferencesStore", () => {
  beforeEach(() => {
    localStorage.clear();
    usePreferencesStore.setState({ theme: "system", language: "system" });
  });

  it("stores theme and language in the existing keys", () => {
    usePreferencesStore.getState().setTheme("dark");
    usePreferencesStore.getState().setLanguage("ko");

    expect(localStorage.getItem("devops-toolkit.theme")).toBe("dark");
    expect(localStorage.getItem("devops-toolkit.language")).toBe("ko");
  });

  it("restores a saved preference and ignores an unknown value", async () => {
    localStorage.setItem("devops-toolkit.theme", "light");
    localStorage.setItem("devops-toolkit.language", "blue");
    await usePreferencesStore.persist.rehydrate();

    expect(usePreferencesStore.getState().theme).toBe("light");
    expect(usePreferencesStore.getState().language).toBe("system");
  });

  it("clears both saved keys", () => {
    usePreferencesStore.getState().setTheme("dark");
    usePreferencesStore.persist.clearStorage();

    expect(localStorage.getItem("devops-toolkit.theme")).toBeNull();
    expect(localStorage.getItem("devops-toolkit.language")).toBeNull();
  });
});
