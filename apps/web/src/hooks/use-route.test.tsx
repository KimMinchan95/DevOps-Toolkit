import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRoute } from "./use-route";

describe("useRoute", () => {
  it("normalizes the current path and moves without reloading", () => {
    window.history.pushState(null, "", "/json-formatter/");
    const { result } = renderHook(() => useRoute());

    expect(result.current.path).toBe("/json-formatter");

    act(() => result.current.navigate("/"));

    expect(result.current.path).toBe("/");
    expect(window.location.pathname).toBe("/");
  });

  it("follows the browser back stack", () => {
    window.history.pushState(null, "", "/");
    const { result } = renderHook(() => useRoute());

    act(() => {
      window.history.pushState(null, "", "/json-formatter");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current.path).toBe("/json-formatter");
  });

  it("does not push the same path again", () => {
    window.history.pushState(null, "", "/");
    const pushState = vi.spyOn(window.history, "pushState");
    const { result } = renderHook(() => useRoute());

    act(() => result.current.navigate("/"));

    expect(pushState).not.toHaveBeenCalled();
    pushState.mockRestore();
  });
});
