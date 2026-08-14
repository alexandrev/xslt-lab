import { describe, it, expect } from "vitest";
import {
  encodeCompact,
  decodeCompact,
  toSharePayload,
  fromSharePayload,
  supportsCompactLinks,
} from "./shareLink";

const TAB = {
  xslt: '<xsl:stylesheet version="2.0"><xsl:template match="/"><a/></xsl:template></xsl:stylesheet>',
  version: "2.0",
  name: "My transform",
  params: [
    { name: "input", value: "<root/>", open: true },
    { name: "empty", value: "", open: false },
  ],
};

describe("share payload", () => {
  it("keeps stylesheet, version, title and non-empty params", () => {
    expect(toSharePayload(TAB)).toEqual({
      x: TAB.xslt,
      v: "2.0",
      t: "My transform",
      p: [["input", "<root/>"]],
    });
  });

  it("round-trips back into workspace overrides", () => {
    const back = fromSharePayload(toSharePayload(TAB));
    expect(back.xslt).toBe(TAB.xslt);
    expect(back.version).toBe("2.0");
    expect(back.name).toBe("My transform");
    expect(back.params).toEqual([{ name: "input", value: "<root/>", open: true }]);
  });

  it("rejects a payload with no stylesheet", () => {
    expect(fromSharePayload({ v: "2.0" })).toBeNull();
    expect(fromSharePayload(null)).toBeNull();
  });

  it("defaults the version when it is missing", () => {
    expect(fromSharePayload({ x: "<a/>" }).version).toBe("1.0");
  });
});

describe.runIf(supportsCompactLinks())("compact encoding", () => {
  it("round-trips a workspace through compression", async () => {
    const encoded = await encodeCompact(toSharePayload(TAB));
    expect(typeof encoded).toBe("string");
    expect(encoded).not.toMatch(/[+/=]/); // URL-safe alphabet only
    const decoded = await decodeCompact(encoded);
    expect(fromSharePayload(decoded).xslt).toBe(TAB.xslt);
  });

  it("is markedly shorter than plain base64 for a real stylesheet", async () => {
    const big = { x: TAB.xslt.repeat(20), v: "2.0" };
    const encoded = await encodeCompact(big);
    const plain = btoa(unescape(encodeURIComponent(big.x)));
    expect(encoded.length).toBeLessThan(plain.length / 2);
  });

  it("returns null for a corrupt value instead of throwing", async () => {
    expect(await decodeCompact("not-actually-gzip")).toBeNull();
    expect(await decodeCompact("")).toBeNull();
  });
});

describe("fiddles", () => {
  it("round-trips a workspace payload including the expected output", async () => {
    const calls = [];
    global.fetch = async (url, opts) => {
      calls.push({ url, opts });
      if (opts?.method === "POST") {
        return { ok: true, json: async () => ({ id: "AbCdEfG", revision: 1 }) };
      }
      const body = JSON.parse(calls[0].opts.body).payload;
      return { ok: true, json: async () => ({ id: "AbCdEfG", revision: 1, revisions: 1, payload: body }) };
    };
    const { saveFiddle, loadFiddle } = await import("./shareLink");
    const tab = { xslt: "<x/>", version: "2.0", name: "t", params: [{ name: "input", value: "<r/>", open: true }], expected: "<out/>" };
    const saved = await saveFiddle("http://b", tab);
    expect(saved).toEqual({ id: "AbCdEfG", revision: 1 });
    const loaded = await loadFiddle("http://b", "AbCdEfG");
    expect(loaded.overrides.xslt).toBe("<x/>");
    expect(loaded.overrides.expected).toBe("<out/>");
  });

  it("returns null on a missing fiddle instead of throwing", async () => {
    global.fetch = async () => ({ ok: false, status: 404 });
    const { loadFiddle } = await import("./shareLink");
    expect(await loadFiddle("http://b", "zzzzzzz")).toBeNull();
  });
});
