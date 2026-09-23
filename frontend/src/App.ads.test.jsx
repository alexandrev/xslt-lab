// The ad path needs its own file because App.jsx reads `window.env` once at
// module scope, so the flag that enables ads has to be set before the import.
//
// What this pins: the app must refresh its ad through its own slot, never
// through ethicalads.reload(), and must unload the placement first. On
// 2026-09-18 the slot was marked data-ea-manual to stop a duplicated view
// beacon, and that silently disabled the refresh — reload() only rotates
// placements the client discovered by itself. The first attempt at a fix,
// load() on our own slot, was also a no-op: the client ignores load() on a
// placement it has already filled. Both wrong versions reported success. The app monetises by
// session length, one decision per page load is worth a fraction of one
// refreshed every minute while somebody edits, and ad revenue halved for five
// days before the drop was noticed. A call that succeeds and does nothing
// leaves no other trace, so it is worth a test of its own.
import { render, waitFor, cleanup, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@monaco-editor/react", () => ({
  default: () => <div data-testid="monaco-editor" />,
}));
vi.mock("ga-4-react", () => ({
  default: class {
    initialize() {
      return Promise.resolve();
    }
  },
}));

let App;
let ethicalads;
let observerCallbacks;

beforeEach(async () => {
  observerCallbacks = [];
  // Enabled before render so the app's 30s refresh interval, registered in a
  // mount effect, is the fake one. shouldAdvanceTime keeps the real async work
  // (debounces, effects, waitFor) moving.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb) {
        observerCallbacks.push(cb);
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({ ok: true, json: async () => ({ result: "<root/>", duration_ms: 5 }) }),
    ),
  );
  localStorage.clear();

  ethicalads = { load: vi.fn(), reload: vi.fn(), unload_placements: vi.fn() };
  window.ethicalads = ethicalads;
  // jsdom serves on localhost, so the ads path needs the dev opt-in.
  window.env = {
    VITE_BACKEND_URL: "",
    VITE_GA_ID: "",
    VITE_GO_PRO: "false",
    VITE_ETHICALADS_DEV: "true",
  };

  vi.resetModules();
  ({ default: App } = await import("./App"));
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
  vi.unstubAllGlobals();
  delete window.ethicalads;
  delete window.env;
  vi.restoreAllMocks();
});

describe("ad refresh", () => {
  it("refreshes through its own slot, which is the only thing a manual placement answers to", async () => {
    render(<App />);

    const slot = await waitFor(
      () => {
        const el = document.getElementById("xsltplayground-main");
        if (!el) throw new Error("ad slot not rendered");
        return el;
      },
      { timeout: 3000 },
    );

    // The manual flag is what stops the client double-initialising the slot,
    // and also what makes reload() useless on it. The two go together.
    expect(slot.getAttribute("data-ea-manual")).toBe("true");

    // Let the app see the ad as on-screen, the way the real observer would.
    await act(async () => {
      observerCallbacks.forEach((cb) => cb([{ isIntersecting: true }]));
    });

    const loadsBefore = ethicalads.load.mock.calls.length;

    // Step past the 60s throttle without waiting for it.
    const realNow = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(realNow + 120_000);
    // The refresh is driven by a 30s interval; advance it.
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(ethicalads.reload).not.toHaveBeenCalled();
    const refreshes = ethicalads.load.mock.calls.slice(loadsBefore);
    expect(refreshes.length).toBeGreaterThan(0);
    expect(refreshes.at(-1)[0]).toBe(slot);
    // The client ignores load() on a placement it has already filled, so the
    // unload has to come first or the refresh is a no-op that reports success.
    expect(ethicalads.unload_placements).toHaveBeenCalled();
    const unloadOrder = ethicalads.unload_placements.mock.invocationCallOrder.at(-1);
    const loadOrder = ethicalads.load.mock.invocationCallOrder.at(-1);
    expect(unloadOrder).toBeLessThan(loadOrder);
  }, 15000);
});
