// Opening a comparison in Kotej, the folder and file comparator
// (https://kotej.app): two versions of a stylesheet or of
// its output, or the output against the expected result, shown with Kotej's
// semantic XML diff and its unified and word-by-word layouts.
//
// The texts travel by postMessage, never in the URL, so there is no size limit
// and nothing lands in a log. Kotej is opened with ?handoff=1, says it is
// ready, receives { type: "kotej:compare", … } and confirms. Kotej only takes
// the message from this site's origins, and it is only ever sent to Kotej's.

const env = (typeof window !== "undefined" && window.env) || import.meta.env || {};

/** Where Kotej lives. Overridable at runtime for a move to another domain. */
export const KOTEJ_URL = (env.VITE_KOTEJ_URL || "https://kotej.app").replace(/\/$/, "");

// Its origins: the current one, and the domain it is moving to, so a redirect
// between the two doesn't break the exchange.
const KOTEJ_ORIGINS = new Set([
  new URL(KOTEJ_URL).origin,
  "https://kotej.alexandre-vazquez.cloud",
  "https://kotej.app",
]);

/** How long to wait for Kotej to load and answer before giving up quietly. */
const HANDOFF_TIMEOUT_MS = 30000;

/** A file name for a text, with the extension Kotej should treat it by. */
export function fileNameFor(label, text) {
  const head = String(text ?? "").trimStart().slice(0, 200).toLowerCase();
  const ext =
    head.startsWith("<!doctype html") || head.startsWith("<html") ? "html"
    : head.startsWith("<") ? "xml"
    : head.startsWith("{") || head.startsWith("[") ? "json"
    : "txt";
  return `${label}.${ext}`;
}

/** The address Kotej is opened at: the handoff flag and where the visit came from. */
export function kotejUrl(kind) {
  const params = new URLSearchParams({
    handoff: "1",
    utm_source: "xsltplayground",
    utm_medium: "referral",
    utm_campaign: kind,
  });
  return `${KOTEJ_URL}/?${params}`;
}

/**
 * Opens Kotej on a comparison. Must run inside the click handler, or the
 * browser blocks the window. Returns false when it was blocked anyway.
 *
 * kind: what is being compared — "expected", "history" or "revision" — kept
 * as a label for both sites' analytics.
 * sides: { left, right }, each a { name, text }, or a promise of them when
 * they still have to be fetched: the window has to open now, the texts can
 * follow once Kotej has loaded.
 */
export function openInKotej(kind, sides) {
  const target = window.open(kotejUrl(kind), "_blank");
  if (!target) return false;

  const message = Promise.resolve(sides).then(({ left, right }) => ({
    type: "kotej:compare",
    source: "xsltplayground",
    kind,
    left: { name: left.name, text: String(left.text ?? "") },
    right: { name: right.name, text: String(right.text ?? "") },
  }));
  message.catch(() => {});
  const finish = () => {
    window.removeEventListener("message", onMessage);
    window.clearTimeout(timer);
  };
  function onMessage(event) {
    if (event.source !== target || !KOTEJ_ORIGINS.has(event.origin)) return;
    const origin = event.origin;
    if (event.data?.type === "kotej:ready") {
      message.then((m) => target.postMessage(m, origin), finish);
    } else if (event.data?.type === "kotej:received") {
      finish();
    }
  }
  window.addEventListener("message", onMessage);
  const timer = window.setTimeout(finish, HANDOFF_TIMEOUT_MS);

  window.gtag?.("event", "open_in_kotej", { event_category: "engagement", kind });
  return true;
}
