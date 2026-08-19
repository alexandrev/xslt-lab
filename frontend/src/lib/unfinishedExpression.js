// The other half of the mid-keystroke problem.
//
// checkWellFormed() stops a document that is not yet valid XML, which removed
// about half the wasted round-trips. What it cannot see is a stylesheet that
// parses perfectly well and carries an XPath expression the user is still in
// the middle of typing: `<xsl:value-of select="/Shop/Category/">` is
// well-formed XML and a compile error, so it went to the backend anyway. A day
// of production logs (2026-08-19) is mostly this, keystroke by keystroke:
//
//   Syntax error in 'current()/..[@N'  →  '[@Na'  →  '[@Name'  →  '[@Name = '
//   line 15: Required attribute 'select' is missing.      (65 times, one line)
//   XPST0003: The expression is empty
//
// Everything below is a fact about the expression, never a guess about intent:
// an attribute that is required and absent, a value that is empty, a quote or
// bracket that is still open, or a trailing token that cannot legally end an
// expression. Anything we are not certain about runs, exactly as before — and
// like the well-formedness gate, this only holds back the automatic run, never
// an explicit one.

const XSLT_NS = "http://www.w3.org/1999/XSL/Transform";

// Elements that cannot compile without the listed attribute. xsl:value-of is
// the exception: XSLT 2.0 lets a sequence constructor stand in for select, so
// it only counts as missing when the element is also empty.
const REQUIRED = {
  "value-of": "select",
  "for-each": "select",
  "for-each-group": "select",
  "copy-of": "select",
  if: "test",
  when: "test",
};

// Attributes holding an XPath expression or a match pattern.
const XPATH_ATTRS = [
  "select",
  "test",
  "match",
  "use",
  "group-by",
  "group-adjacent",
];

// Tokens that cannot be the last thing in a complete expression. Word
// operators are only counted when something precedes them, so `select="and"`
// — a perfectly good path selecting <and> children — is left alone.
const TRAILING_SYMBOLS = [
  "//",
  "/",
  "[",
  "(",
  ",",
  "@",
  "$",
  "::",
  ":",
  "=",
  "!=",
  "<=",
  ">=",
  "<",
  ">",
  "+",
  "-",
  "|",
  "!",
];
const TRAILING_WORDS = [
  "and",
  "or",
  "div",
  "idiv",
  "mod",
  "to",
  "eq",
  "ne",
  "lt",
  "gt",
  "le",
  "ge",
  "is",
  "instance",
  "of",
  "as",
  "castable",
  "cast",
  "treat",
  "return",
  "in",
  "satisfies",
  "then",
  "else",
];

// Characters that cannot be the last thing before a closing bracket: the
// expression inside was still being written when the bracket went in.
const CANNOT_PRECEDE_CLOSE = new Set([
  "/",
  ",",
  "@",
  "$",
  "=",
  "<",
  ">",
  "+",
  "-",
  "|",
  "!",
  ":",
  "[",
]);

// Walks the value once, tracking string literals so brackets inside a quoted
// string are not mistaken for structure. Also reports the first closing bracket
// that arrives too early — `[@id = ]`, `[@id = current()/]` — which is the same
// unfinished edit as a trailing operator, just with the predicate typed around
// it before the expression inside was done.
function scan(value) {
  let quote = null;
  let round = 0;
  let square = 0;
  let danglingBefore = null;
  let prev = ""; // last significant character, whitespace skipped
  for (const ch of value) {
    if (quote) {
      if (ch === quote) quote = null;
      prev = quote ? "" : "'";
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) continue;
    if (ch === ")" || ch === "]") {
      // Empty parentheses are a function call — node(), true(), count() — but
      // an empty predicate is not a thing, and neither is an operator left
      // hanging in front of the close.
      const emptyPair = prev === "(" || prev === "[";
      if ((emptyPair && ch === "]") || (!emptyPair && CANNOT_PRECEDE_CLOSE.has(prev))) {
        danglingBefore = danglingBefore ?? (prev === "[" ? ch : prev);
      }
    }
    if (ch === "(") round += 1;
    else if (ch === ")") round -= 1;
    else if (ch === "[") square += 1;
    else if (ch === "]") square -= 1;
    prev = ch;
  }
  return { openQuote: Boolean(quote), round, square, danglingBefore };
}

// Returns a short reason when the expression is provably incomplete, else null.
export function describeUnfinished(value) {
  const text = (value || "").trim();
  if (!text) return "is empty";

  const { openQuote, round, square, danglingBefore } = scan(text);
  if (openQuote) return "has a quote that is still open";
  if (round > 0) return "has a ( that is never closed";
  if (square > 0) return "has a [ that is never closed";
  if (danglingBefore) {
    return danglingBefore === "]"
      ? "has an empty predicate"
      : `stops at "${danglingBefore}" inside a bracket`;
  }
  // Unbalanced the other way is a mistake, not an unfinished edit: let the
  // processor report it properly.
  if (round < 0 || square < 0) return null;

  // "/" on its own is the root pattern, not a path someone abandoned midway.
  if (text === "/") return null;

  for (const token of TRAILING_SYMBOLS) {
    if (text.endsWith(token)) return `stops at "${token}"`;
  }
  const words = text.split(/\s+/);
  if (words.length > 1 && TRAILING_WORDS.includes(words[words.length - 1])) {
    return `stops at "${words[words.length - 1]}"`;
  }
  return null;
}

function elementLabel(el) {
  return `<${el.prefix ? `${el.prefix}:` : ""}${el.localName}>`;
}

// Above this the check is skipped entirely. It runs on every keystroke, on top
// of the well-formedness parse, and the walk is not free on a large document
// (jsdom: ~2ms at 3KB, ~15ms at 34KB, ~250ms at 100KB). It also stops being
// worth it: nobody types a 64KB stylesheet character by character — a document
// that size was pasted, and a pasted document is finished. So the cost is
// capped where the problem it solves stops existing.
const MAX_SCANNED_BYTES = 64 * 1024;

// Scans a stylesheet for the first expression that is still being typed.
// Returns { message } or null. Callers pass text that is already known to
// parse; anything that does not parse is the well-formedness gate's business.
export function findUnfinishedExpression(xslt) {
  if (!xslt || !xslt.trim()) return null;
  if (xslt.length > MAX_SCANNED_BYTES) return null;
  let doc;
  try {
    doc = new DOMParser().parseFromString(xslt, "application/xml");
  } catch {
    return null; // no parser here: let the backend decide, as before
  }
  if (doc.querySelector("parsererror")) return null;

  // Array.from, not for..of: an HTMLCollection is only iterable by grace of
  // the browsers, and this has to hold in every one of them.
  const elements = Array.from(doc.getElementsByTagNameNS(XSLT_NS, "*"));
  for (const el of elements) {
    const required = REQUIRED[el.localName];
    if (required && !el.hasAttribute(required)) {
      // A sequence constructor is a legitimate alternative to value-of/@select.
      if (el.localName === "value-of" && el.childNodes.length > 0) continue;
      return {
        message: `${elementLabel(el)} has no ${required} expression yet`,
      };
    }
    for (const attr of XPATH_ATTRS) {
      if (!el.hasAttribute(attr)) continue;
      const value = el.getAttribute(attr);
      const reason = describeUnfinished(value);
      if (reason) {
        const shown = value.trim();
        return {
          message: shown
            ? `${attr}="${shown}" on ${elementLabel(el)} ${reason}`
            : `${attr} on ${elementLabel(el)} ${reason}`,
        };
      }
    }
  }
  return null;
}
