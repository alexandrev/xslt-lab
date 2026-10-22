import { describe, it, expect, vi, afterEach } from "vitest";
import { fileNameFor, kotejUrl, openInKotej, KOTEJ_URL } from "./kotej";

describe("fileNameFor", () => {
  it("names a text by what it looks like", () => {
    expect(fileNameFor("output", '<?xml version="1.0"?><a/>')).toBe("output.xml");
    expect(fileNameFor("output", "\n  <!DOCTYPE html><html></html>")).toBe("output.html");
    expect(fileNameFor("output", '{"a":1}')).toBe("output.json");
    expect(fileNameFor("output", "plain text")).toBe("output.txt");
    expect(fileNameFor("output", undefined)).toBe("output.txt");
  });
});

describe("openInKotej", () => {
  afterEach(() => vi.restoreAllMocks());

  it("tags the visit and carries nothing of the texts in the URL", () => {
    const url = new URL(kotejUrl("history"));
    expect(url.origin).toBe(new URL(KOTEJ_URL).origin);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      handoff: "1", utm_source: "xsltplayground", utm_medium: "referral", utm_campaign: "history",
    });
  });

  it("sends the texts only to Kotej, once it says it is ready", async () => {
    const target = { postMessage: vi.fn() };
    vi.spyOn(window, "open").mockReturnValue(target);
    const left = { name: "a.xml", text: "<a/>" };
    const right = { name: "b.xml", text: "<b/>" };
    expect(openInKotej("expected", { left, right })).toBe(true);

    const origin = new URL(KOTEJ_URL).origin;
    // Another window, or another origin, gets nothing.
    window.dispatchEvent(new MessageEvent("message", { data: { type: "kotej:ready" }, origin, source: window }));
    window.dispatchEvent(new MessageEvent("message", {
      data: { type: "kotej:ready" }, origin: "https://evil.example", source: target,
    }));
    expect(target.postMessage).not.toHaveBeenCalled();

    window.dispatchEvent(new MessageEvent("message", { data: { type: "kotej:ready" }, origin, source: target }));
    await Promise.resolve(); await Promise.resolve();
    expect(target.postMessage).toHaveBeenCalledWith(
      { type: "kotej:compare", source: "xsltplayground", kind: "expected", left, right }, origin,
    );

    // Once received, it stops listening.
    window.dispatchEvent(new MessageEvent("message", { data: { type: "kotej:received" }, origin, source: target }));
    window.dispatchEvent(new MessageEvent("message", { data: { type: "kotej:ready" }, origin, source: target }));
    await new Promise((r) => setTimeout(r, 0));
    expect(target.postMessage).toHaveBeenCalledTimes(1);
  });

  it("opens at once and sends texts that arrive later", async () => {
    const target = { postMessage: vi.fn() };
    vi.spyOn(window, "open").mockReturnValue(target);
    let resolve;
    const later = new Promise((r) => { resolve = r; });
    openInKotej("revision", later);
    expect(window.open).toHaveBeenCalled();
    const origin = new URL(KOTEJ_URL).origin;
    window.dispatchEvent(new MessageEvent("message", { data: { type: "kotej:ready" }, origin, source: target }));
    await new Promise((r) => setTimeout(r, 0));
    expect(target.postMessage).not.toHaveBeenCalled();
    resolve({ left: { name: "rev 1.xsl", text: "a" }, right: { name: "rev 2.xsl", text: "b" } });
    await new Promise((r) => setTimeout(r, 0));
    expect(target.postMessage.mock.calls[0][0].left.name).toBe("rev 1.xsl");
  });

  it("says so when the window was blocked", () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    expect(openInKotej("expected", { left: { name: "a", text: "" }, right: { name: "b", text: "" } }))
      .toBe(false);
  });
});
