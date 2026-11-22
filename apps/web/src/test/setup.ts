import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { usePreferencesStore } from "../stores/preferences";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  usePreferencesStore.setState({ theme: "system", language: "system" });
  window.history.pushState(null, "", "/");
  document.title = "";
});
