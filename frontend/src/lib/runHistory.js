// Version history of a workspace: the stylesheets that ran, with their input
// and output, kept in the browser so an earlier version can be compared with
// the current one (in Kotej) or brought back.
//
// The editor runs on every pause in typing, so not every run is a version: a
// run within a short while of the last one replaces it, and a run that changes
// nothing is not recorded. Only the last few versions are kept, and only while
// they fit: localStorage is small and shared with the workspaces.

export const MAX_VERSIONS = 25;
/** Runs closer together than this are the same edit still in progress. */
export const SETTLE_MS = 60 * 1000;
/** Bigger than this, the input is dropped from the version, then the version itself. */
const MAX_VERSION_CHARS = 200 * 1024;

const KEY_PREFIX = "runHistory:";

/**
 * Adds a run to a history (newest first) and returns the new history.
 * run: { xslt, input, output, version }
 */
export function recordRun(history, run, now = Date.now()) {
  const list = Array.isArray(history) ? history : [];
  const latest = list[0];
  if (latest && latest.xslt === run.xslt && latest.input === run.input && latest.output === run.output) {
    return list;
  }
  let entry = {
    n: (latest?.n || 0) + 1,
    at: now,
    xslt: String(run.xslt ?? ""),
    input: String(run.input ?? ""),
    output: String(run.output ?? ""),
    version: run.version || "1.0",
  };
  if (entry.xslt.length + entry.input.length + entry.output.length > MAX_VERSION_CHARS) {
    entry = { ...entry, input: null };
    if (entry.xslt.length + entry.output.length > MAX_VERSION_CHARS) return list;
  }
  // Still the same edit: replace it, but keep its number, so versions are not
  // numbered by keystroke.
  if (latest && now - latest.at < SETTLE_MS) {
    return [{ ...entry, n: latest.n }, ...list.slice(1)];
  }
  return [entry, ...list].slice(0, MAX_VERSIONS);
}

export function loadHistory(tabId, storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(KEY_PREFIX + tabId) || "[]");
    return Array.isArray(parsed) ? parsed.filter((v) => v && typeof v.xslt === "string") : [];
  } catch {
    return [];
  }
}

/** Saves a history, dropping the oldest versions until it fits. */
export function saveHistory(tabId, history, storage = globalThis.localStorage) {
  let list = history;
  while (list.length) {
    try {
      storage.setItem(KEY_PREFIX + tabId, JSON.stringify(list));
      return list;
    } catch {
      list = list.slice(0, Math.floor(list.length / 2));
    }
  }
  try { storage.removeItem(KEY_PREFIX + tabId); } catch {}
  return list;
}

/** Forgets the history of tabs that no longer exist. */
export function pruneHistories(tabIds, storage = globalThis.localStorage) {
  try {
    const keep = new Set(tabIds.map((id) => KEY_PREFIX + id));
    const stale = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(KEY_PREFIX) && !keep.has(key)) stale.push(key);
    }
    stale.forEach((key) => storage.removeItem(key));
  } catch {}
}

/** "just now", "5 min ago", "3 h ago", or the date. */
export function ago(at, now = Date.now()) {
  const minutes = Math.floor((now - at) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(at).toLocaleDateString();
}
