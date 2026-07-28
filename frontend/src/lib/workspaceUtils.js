const PARAM_START = "<!--PARAMS_START-->";
const PARAM_END = "<!--PARAMS_END-->";

export function parseErrorLines(txt) {
  if (!txt) return [];
  const starts = [];
  const regex = /(^|\r?\n)(Warning|Error)\b/g;
  let m;
  while ((m = regex.exec(txt)) !== null) {
    const start = m.index + (m[1] ? m[1].length : 0);
    starts.push(start);
  }
  if (starts.length === 0) {
    return [txt.trim()].filter(Boolean);
  }
  const lines = [];
  const leading = txt.slice(0, starts[0]).trim();
  if (leading) lines.push(leading);
  for (let i = 0; i < starts.length; i++) {
    const s = starts[i];
    const e = i + 1 < starts.length ? starts[i + 1] : txt.length;
    const chunk = txt.slice(s, e).trim();
    if (chunk) lines.push(chunk);
  }
  return lines;
}

export function stripParamBlock(text) {
  const start = text.indexOf(PARAM_START);
  const end = text.indexOf(PARAM_END);
  let result = text;
  if (start !== -1 && end !== -1 && end > start) {
    let before = text.slice(0, start);
    let after = text.slice(end + PARAM_END.length);
    if (before.endsWith("\n")) before = before.slice(0, -1);
    if (after.startsWith("\n")) after = after.slice(1);
    result = before + after;
  }

  const stylesheetOpen = result.match(/<xsl:stylesheet[^>]*>/);
  if (!stylesheetOpen) return result;

  const headEnd = stylesheetOpen.index + stylesheetOpen[0].length;
  const tail = result.slice(headEnd);
  const leadingParams = tail.match(
    /^[\r\n\t ]*(?:<xsl:param\b[^>]*?(?:\/>|>[\s\S]*?<\/xsl:param>)[\r\n\t ]*)+/,
  );
  if (!leadingParams) return result;

  return result.slice(0, headEnd) + tail.slice(leadingParams[0].length);
}

export function getParamBlock(text) {
  const start = text.indexOf(PARAM_START);
  const end = text.indexOf(PARAM_END);
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end);
  }
  return text;
}

export function injectParamBlock(text, params) {
  const clean = stripParamBlock(text);
  const match = clean.match(/<xsl:stylesheet[^>]*>/);
  if (!match) return clean;
  const idx = match.index + match[0].length;
  const paramLines = params
    .filter((p) => p.name)
    .map((p) => `<xsl:param name="${p.name}"/>`)
    .join("\n");
  const block = `\n${PARAM_START}\n${paramLines}\n${PARAM_END}`;
  return clean.slice(0, idx) + block + clean.slice(idx);
}

export function extractParamNames(text) {
  const block = getParamBlock(text);
  if (block !== text) {
    return collectParamNames(block);
  }

  const stylesheetOpen = text.match(/<xsl:stylesheet[^>]*>/);
  if (!stylesheetOpen) return [];

  const headEnd = stylesheetOpen.index + stylesheetOpen[0].length;
  const tail = text.slice(headEnd);
  const leadingParams = tail.match(
    /^[\r\n\t ]*(?:<xsl:param\b[^>]*?(?:\/>|>[\s\S]*?<\/xsl:param>)[\r\n\t ]*)+/,
  );
  if (!leadingParams) return [];

  return collectParamNames(leadingParams[0]);
}

function collectParamNames(fragment) {
  const names = new Set();
  const regex = /<xsl:param[^>]*name="([^"]+)"[^>]*>/g;
  let m;
  while ((m = regex.exec(fragment))) {
    names.add(m[1]);
  }
  return Array.from(names);
}

export function addParams(text, tab) {
  const extractedParams = extractParamNames(text);
  const existingNames = new Set(tab.params.map((p) => p.name));
  const newParams = [...tab.params];

  extractedParams.forEach((name) => {
    if (!existingNames.has(name)) {
      newParams.push({ name, value: "<root/>", open: false });
    }
  });

  return newParams;
}

export function setStylesheetVersion(text, version) {
  const regex = /<xsl:stylesheet\b([^>]*)>/;
  const match = text.match(regex);
  if (!match) return text;
  let attrs = match[1];
  if (/version=['"][^'"]*['"]/.test(attrs)) {
    attrs = attrs.replace(/version=['"][^'"]*['"]/, `version="${version}"`);
  } else {
    attrs += ` version="${version}"`;
  }
  return text.replace(regex, `<xsl:stylesheet${attrs}>`);
}

export function getParamBlockMarkers() {
  return { PARAM_START, PARAM_END };
}

const BLOG_ORIGIN = "https://xsltplayground.com/blog";

// Saxon/XPath error codes that have a dedicated reference page on the blog.
const DOCUMENTED_ERROR_CODES = new Set([
  "FODC0002", "FORG0001", "FORX0002", "SXXP0003",
  "XPDY0002", "XPST0008", "XPST0017", "XPST0081", "XPTY0004",
  "XTDE1490", "XTMM9000", "XTRE0540", "XTSE0010", "XTSE0630",
]);

// Well-formedness failures Saxon reports as prose, which also have a page.
const DOCUMENTED_ERROR_PHRASES = [
  [/content is not allowed in prolog/i, "content-not-allowed-in-prolog"],
  [/entity name must immediately follow/i, "entity-name-must-immediately-follow"],
  [/markup in the document following the root element/i, "markup-following-root-element"],
];

// Find the first documented error in a Saxon message and return a link to its
// reference page, so the error box can explain the failure instead of only
// showing it. Returns { code, url } or null.
export function findErrorReference(errorText) {
  if (!errorText) return null;
  const codeMatch = errorText.match(/\b[A-Z]{4}[0-9]{4}\b/);
  if (codeMatch && DOCUMENTED_ERROR_CODES.has(codeMatch[0])) {
    return {
      code: codeMatch[0],
      url: `${BLOG_ORIGIN}/xslt/errors/${codeMatch[0].toLowerCase()}/`,
    };
  }
  for (const [re, slug] of DOCUMENTED_ERROR_PHRASES) {
    if (re.test(errorText)) return { code: null, url: `${BLOG_ORIGIN}/xslt/errors/${slug}/` };
  }
  return null;
}

// Functions introduced in later XSLT/XPath versions. When a transform fails in a
// lower version and the error mentions one of these being called, the user most
// likely just needs to bump the version (the XSLT 1.0 engine has no such function).
const FN_MIN_VERSION = {
  // XPath / XSLT 2.0
  "current-date": "2.0",
  "current-time": "2.0",
  "current-dateTime": "2.0",
  tokenize: "2.0",
  replace: "2.0",
  matches: "2.0",
  exists: "2.0",
  empty: "2.0",
  "distinct-values": "2.0",
  "upper-case": "2.0",
  "lower-case": "2.0",
  "ends-with": "2.0",
  "string-join": "2.0",
  "index-of": "2.0",
  avg: "2.0",
  "format-date": "2.0",
  "format-dateTime": "2.0",
  // XPath / XSLT 3.0
  "parse-json": "3.0",
  "json-to-xml": "3.0",
  "xml-to-json": "3.0",
  "parse-xml": "3.0",
  "fold-left": "3.0",
  "fold-right": "3.0",
};

// Given an error message and the current version, detect whether the failure is
// caused by calling a function from a newer XSLT version. Returns
// { func, version } (the minimum version that supports it) or null.
export function detectVersionUpgradeHint(errorText, currentVersion) {
  if (!errorText || !currentVersion) return null;
  const cur = parseFloat(currentVersion);
  if (!Number.isFinite(cur)) return null;
  // map:*/array:* constructors are XSLT 3.0 (require the call form to avoid noise).
  if (cur < 3 && /\b(?:map|array):[a-z-]+\s*\(/i.test(errorText)) {
    return { func: "map/array", version: "3.0" };
  }
  for (const [fn, minV] of Object.entries(FN_MIN_VERSION)) {
    if (parseFloat(minV) <= cur) continue;
    // Require a call shape (`fn(` / `funcall(fn` / `fn,`) so plain words don't match.
    const re = new RegExp(`(?:funcall\\(\\s*)?\\b${fn}\\b\\s*[(,]`);
    if (re.test(errorText)) return { func: fn, version: minV };
  }
  return null;
}

// True when the stylesheet can no longer be repaired by editing — it is empty
// or not well-formed XML — so the UI can offer to restore the starter skeleton.
export function needsStylesheetReset(xslt) {
  if (!xslt || !xslt.trim()) return true;
  try {
    const doc = new DOMParser().parseFromString(xslt, "application/xml");
    return Boolean(doc.querySelector("parsererror"));
  } catch {
    return false;
  }
}
