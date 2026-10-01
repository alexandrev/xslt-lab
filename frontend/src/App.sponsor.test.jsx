// Like the ad test, this needs its own file: App.jsx reads window.env once at
// module scope, so the sponsor has to be configured before the import.
import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("ga-4-react", () => ({
  default: class {
    initialize() {
      return Promise.resolve();
    }
  },
}));

let App;
let parseSponsor;
let observerCallbacks;

beforeEach(async () => {
  observerCallbacks = [];
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
    vi.fn(() => Promise.resolve({ ok: true, json: async () => ({ result: "<root/>", duration_ms: 5 }) })),
  );
  window.gtag = vi.fn();
  window.ethicalads = { load: vi.fn(), reload: vi.fn(), unload_placements: vi.fn() };
  localStorage.clear();
  window.env = {
    VITE_BACKEND_URL: "",
    VITE_GO_PRO: "false",
    VITE_ETHICALADS_DEV: "true",
    VITE_SPONSOR: JSON.stringify({ name: "Acme XML", tagline: "Validate at scale", url: "https://acme.example/xml" }),
  };
  vi.resetModules();
  ({ default: App, parseSponsor } = await import("./App"));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete window.gtag;
  delete window.ethicalads;
  delete window.env;
});

describe("parseSponsor", () => {
  it("tags the link for the sponsor's own analytics", () => {
    const s = parseSponsor('{"name":"Acme","url":"https://acme.example/"}');
    const url = new URL(s.url);
    expect(url.searchParams.get("utm_source")).toBe("xsltplayground");
    expect(url.searchParams.get("utm_medium")).toBe("sponsorship");
  });
  it("keeps the sponsor's own UTM parameters", () => {
    const s = parseSponsor('{"name":"Acme","url":"https://acme.example/?utm_source=theirs"}');
    expect(new URL(s.url).searchParams.get("utm_source")).toBe("theirs");
  });
  it("treats broken config as no sponsor, so the ads keep running", () => {
    expect(parseSponsor("")).toBeNull();
    expect(parseSponsor("{not json")).toBeNull();
    expect(parseSponsor('{"name":"","url":"https://a.example"}')).toBeNull();
    expect(parseSponsor('{"name":"Acme","url":"javascript:alert(1)"}')).toBeNull();
  });
});

describe("with a sponsor configured", () => {
  it("shows the sponsor instead of the ad, and reports impressions and clicks", async () => {
    render(<App />);
    const link = await screen.findByRole("link", { name: /Acme XML/ });
    expect(document.getElementById("xsltplayground-main")).toBeNull();
    expect(link.getAttribute("rel")).toContain("sponsored");

    await act(async () => {
      observerCallbacks.forEach((cb) => cb([{ isIntersecting: true }]));
    });
    expect(window.gtag).toHaveBeenCalledWith("event", "sponsor_impression", { sponsor: "Acme XML" });

    fireEvent.click(link);
    expect(window.gtag).toHaveBeenCalledWith("event", "sponsor_click", { sponsor: "Acme XML" });
    expect(window.ethicalads.load).not.toHaveBeenCalled();
  });
});
