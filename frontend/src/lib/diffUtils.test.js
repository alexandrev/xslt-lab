import { describe, it, expect } from "vitest";
import { diffLines } from "./diffUtils";

describe("diffLines", () => {
  it("reports equality for identical output", () => {
    const r = diffLines("<a/>\n<b/>", "<a/>\n<b/>");
    expect(r.equal).toBe(true);
    expect(r.changes).toBe(0);
  });

  it("ignores trailing blank lines and indentation by default", () => {
    const r = diffLines("  <a/>\n\n", "<a/>");
    expect(r.equal).toBe(true);
  });

  it("can be strict about whitespace", () => {
    const r = diffLines("  <a/>", "<a/>", { ignoreWhitespace: false });
    expect(r.equal).toBe(false);
  });

  it("marks a line missing from the actual output as removed", () => {
    const r = diffLines("<a/>", "<a/>\n<b/>");
    expect(r.equal).toBe(false);
    expect(r.rows.find((x) => x.type === "removed").text).toBe("<b/>");
  });

  it("marks an unexpected extra line as added", () => {
    const r = diffLines("<a/>\n<c/>", "<a/>");
    expect(r.rows.find((x) => x.type === "added").text).toBe("<c/>");
  });

  it("keeps common lines aligned instead of rewriting the whole block", () => {
    const r = diffLines("<a/>\n<CHANGED/>\n<c/>", "<a/>\n<b/>\n<c/>");
    expect(r.rows.filter((x) => x.type === "same").map((x) => x.text)).toEqual(["<a/>", "<c/>"]);
    expect(r.changes).toBe(2);
  });

  it("treats empty expected output as no comparison target", () => {
    const r = diffLines("<a/>", "");
    expect(r.equal).toBe(false);
    expect(r.rows.every((x) => x.type === "added")).toBe(true);
  });

  it("truncates very large diffs", () => {
    const big = Array.from({ length: 500 }, (_, i) => `line ${i}`).join("\n");
    const r = diffLines(big, "", { maxRows: 10 });
    expect(r.rows).toHaveLength(10);
    expect(r.truncated).toBe(true);
  });
});
