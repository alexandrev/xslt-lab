import { describe, it, expect, beforeEach } from "vitest";
import {
  recordRun, loadHistory, saveHistory, pruneHistories, MAX_VERSIONS, SETTLE_MS,
} from "./runHistory";

const run = (xslt, output = "<out/>", input = "<root/>") => ({ xslt, input, output, version: "3.0" });

describe("recordRun", () => {
  it("records a first run as version 1", () => {
    const history = recordRun([], run("a"), 1000);
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ n: 1, at: 1000, xslt: "a", output: "<out/>", version: "3.0" });
  });

  it("skips a run that changes nothing", () => {
    const first = recordRun([], run("a"), 0);
    expect(recordRun(first, run("a"), SETTLE_MS * 5)).toBe(first);
  });

  it("folds runs of the same edit into one version", () => {
    let history = recordRun([], run("a"), 0);
    history = recordRun(history, run("ab"), 10_000);
    history = recordRun(history, run("abc"), 20_000);
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ n: 1, xslt: "abc", at: 20_000 });
  });

  it("starts a new version after a pause", () => {
    let history = recordRun([], run("a"), 0);
    history = recordRun(history, run("b"), SETTLE_MS + 1);
    expect(history.map((v) => [v.n, v.xslt])).toEqual([[2, "b"], [1, "a"]]);
  });

  it("keeps only the last versions", () => {
    let history = [];
    for (let i = 0; i < MAX_VERSIONS + 5; i++) history = recordRun(history, run(`v${i}`), i * SETTLE_MS * 2);
    expect(history).toHaveLength(MAX_VERSIONS);
    expect(history[0].xslt).toBe(`v${MAX_VERSIONS + 4}`);
  });

  it("drops a big input before dropping the version", () => {
    const big = "x".repeat(300 * 1024);
    const history = recordRun([], run("a", "<out/>", big), 0);
    expect(history[0].input).toBeNull();
    expect(recordRun([], run("a", big, ""), 0)).toEqual([]);
  });
});

describe("storage", () => {
  let store;
  const storage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => {
      if (v.length > 30) throw new Error("QuotaExceededError");
      store.set(k, v);
    },
    removeItem: (k) => store.delete(k),
    key: (i) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };
  beforeEach(() => { store = new Map(); });

  it("round-trips and ignores junk", () => {
    store.set("runHistory:1", JSON.stringify([{ n: 1, xslt: "a" }, null, { n: 2 }]));
    expect(loadHistory(1, storage)).toEqual([{ n: 1, xslt: "a" }]);
    store.set("runHistory:2", "{not json");
    expect(loadHistory(2, storage)).toEqual([]);
  });

  it("drops the oldest versions until the history fits", () => {
    const history = [1, 2, 3, 4].map((n) => ({ n, xslt: "s" }));
    const saved = saveHistory(7, history, storage);
    expect(saved.map((v) => v.n)).toEqual([1]);
    expect(loadHistory(7, storage)).toEqual(saved);
  });

  it("forgets the histories of closed tabs", () => {
    store.set("runHistory:1", "[]");
    store.set("runHistory:2", "[]");
    store.set("tabs", "[]");
    pruneHistories([2], storage);
    expect([...store.keys()].sort()).toEqual(["runHistory:2", "tabs"]);
  });
});
