// Cross-checks between the stylesheet and the input document.
//
// These are deliberately *facts*, not style opinions: each one describes a
// concrete, reproducible way the transform misbehaves. An audience of XSLT
// practitioners will forgive a missing hint, but not a confident wrong one, so
// every rule here bails out the moment it cannot prove its case.

const XSLT_NS = "http://www.w3.org/1999/XSL/Transform";

function parseXml(text) {
  if (!text || !text.trim()) return null;
  try {
    const doc = new DOMParser().parseFromString(text, "application/xml");
    return doc.querySelector("parsererror") ? null : doc;
  } catch {
    return null;
  }
}

// XPath keywords and axes that look like element names but aren't.
const NON_NAMES = new Set([
  "and", "or", "div", "mod", "idiv", "to", "eq", "ne", "lt", "le", "gt", "ge",
  "is", "if", "then", "else", "for", "in", "return", "some", "every", "satisfies",
  "union", "intersect", "except", "instance", "of", "cast", "castable", "treat", "as",
  "child", "parent", "self", "attribute", "namespace", "descendant", "ancestor",
  "following", "preceding", "sibling", "descendant-or-self", "ancestor-or-self",
  "following-sibling", "preceding-sibling", "text", "node", "comment",
  "processing-instruction", "element", "item", "document-node", "schema-element",
]);

/**
 * Unprefixed element name tests inside an XPath pattern.
 * Conservative by construction: literals, functions, axes, variables, wildcards
 * and anything already carrying a prefix are all discarded, so a name only
 * survives when it really is a bare element reference.
 */
export function unprefixedNameTests(expr) {
  if (!expr) return [];
  // Drop string literals so their contents are never mistaken for names.
  const withoutLiterals = expr.replace(/'[^']*'|"[^"]*"/g, "''");
  const found = new Set();
  // A name test is a NCName not preceded by $ / : and not followed by ( or ::
  const re = /(^|[^\w:$@-])([A-Za-z_][\w.-]*)(?![\w.-])/g;
  let m;
  while ((m = re.exec(withoutLiterals)) !== null) {
    const name = m[2];
    const rest = withoutLiterals.slice(m.index + m[0].length);
    if (/^\s*\(/.test(rest)) continue; // function call
    if (/^\s*::/.test(rest)) continue; // axis
    if (/^\s*:/.test(rest)) continue; // it carries a prefix
    if (NON_NAMES.has(name)) continue;
    found.add(name);
  }
  return [...found];
}

function stylesheetPatterns(doc) {
  const out = [];
  const push = (el, attr) => {
    const v = el.getAttribute(attr);
    if (v) out.push({ el, attr, value: v });
  };
  for (const el of doc.getElementsByTagNameNS(XSLT_NS, "template")) push(el, "match");
  for (const el of doc.getElementsByTagNameNS(XSLT_NS, "apply-templates")) push(el, "select");
  for (const el of doc.getElementsByTagNameNS(XSLT_NS, "for-each")) push(el, "select");
  for (const el of doc.getElementsByTagNameNS(XSLT_NS, "value-of")) push(el, "select");
  for (const el of doc.getElementsByTagNameNS(XSLT_NS, "copy-of")) push(el, "select");
  return out;
}

/**
 * The input document lives in a default namespace, but the stylesheet selects
 * element names without a prefix — so nothing ever matches and the transform
 * silently produces (almost) no output. This is checkable because we hold both
 * documents, which is why it can be stated as fact rather than as a guess.
 */
function checkDefaultNamespace({ stylesheetDoc, inputDoc, version }) {
  if (!stylesheetDoc || !inputDoc) return null;
  const inputNs = inputDoc.documentElement?.namespaceURI;
  if (!inputNs || inputNs === XSLT_NS) return null;

  const root = stylesheetDoc.documentElement;
  if (!root) return null;
  // XSLT 2.0+ can neutralise this in one attribute.
  const xdn = root.getAttribute("xpath-default-namespace");
  if (xdn === inputNs) return null;

  // If any prefix is already bound to the input namespace and actually used,
  // the author clearly knows about the namespace — say nothing.
  const declaredPrefixes = [];
  for (const attr of Array.from(root.attributes)) {
    if (attr.name.startsWith("xmlns:") && attr.value === inputNs) {
      declaredPrefixes.push(attr.name.slice("xmlns:".length));
    }
  }
  const patterns = stylesheetPatterns(stylesheetDoc);
  if (declaredPrefixes.length) {
    const used = patterns.some(({ value }) =>
      declaredPrefixes.some((p) => new RegExp(`(^|[^\\w-])${p}:`).test(value)),
    );
    if (used) return null;
  }

  const offenders = [];
  for (const { attr, value } of patterns) {
    const names = unprefixedNameTests(value);
    if (names.length) offenders.push({ attr, value, names });
  }
  if (!offenders.length) return null;

  const canUseDefaultNs = parseFloat(version) >= 2;
  return {
    id: "default-namespace-mismatch",
    severity: "high",
    title: "Input is in a namespace the stylesheet doesn't match",
    detail:
      `The input document is in the namespace "${inputNs}", but ` +
      `${offenders.length} pattern${offenders.length === 1 ? "" : "s"} select ` +
      `element names without a prefix, so they never match and the transform ` +
      `produces empty output rather than an error.`,
    fix: canUseDefaultNs
      ? `Add xpath-default-namespace="${inputNs}" to xsl:stylesheet.`
      : `XSLT 1.0 has no xpath-default-namespace: declare a prefix ` +
        `(xmlns:ns="${inputNs}") and use it in every pattern, e.g. match="ns:${offenders[0].names[0]}".`,
    examples: offenders.slice(0, 3).map((o) => `${o.attr}="${o.value}"`),
    docUrl: "https://xsltplayground.com/blog/posts/xslt-template-matching-explained/",
  };
}

/**
 * The stylesheet declares one version but is being run as another. Saxon does
 * not reject this: with version="1.0" it switches on forwards-compatible mode,
 * where unknown constructs are silently tolerated at compile time and only fail
 * (or behave differently) at run time.
 */
function checkVersionMismatch({ stylesheetDoc, version }) {
  if (!stylesheetDoc) return null;
  const root = stylesheetDoc.documentElement;
  if (!root || root.namespaceURI !== XSLT_NS) return null;
  const declared = root.getAttribute("version");
  if (!declared) return null;
  const declaredNum = parseFloat(declared);
  const runningNum = parseFloat(version);
  if (!Number.isFinite(declaredNum) || !Number.isFinite(runningNum)) return null;
  if (declaredNum === runningNum) return null;

  return {
    id: "version-mismatch",
    severity: declaredNum < runningNum ? "medium" : "high",
    title: `Stylesheet declares version="${declared}" but is running as XSLT ${version}`,
    detail:
      declaredNum < runningNum
        ? `Saxon honours the version attribute, so the stylesheet still runs under ` +
          `XSLT ${declared} rules — 1.0 semantics differ (xsl:value-of takes the first ` +
          `node instead of the whole sequence, for one), so the output may not be what ` +
          `the selected version suggests.`
        : `The stylesheet asks for features from XSLT ${declared} while running as ` +
          `${version}. Saxon enables forwards-compatible mode, which defers the failure ` +
          `to run time instead of reporting it at compile time.`,
    fix: `Set version="${version}" on xsl:stylesheet, or switch the version selector to ${declared}.`,
    examples: [`<xsl:stylesheet version="${declared}" …>`],
    docUrl: "https://xsltplayground.com/blog/posts/xslt-3-new-features/",
  };
}

const RULES = [checkDefaultNamespace, checkVersionMismatch];

/**
 * Review a workspace. Returns the findings that could be proven from the
 * stylesheet and the input document; an empty array means nothing to say.
 */
export function reviewWorkspace({ xslt, inputXml, version = "1.0" }) {
  const stylesheetDoc = parseXml(xslt);
  // A stylesheet that doesn't parse is already reported by the editor's linter.
  if (!stylesheetDoc) return [];
  const inputDoc = parseXml(inputXml);
  const ctx = { stylesheetDoc, inputDoc, version };
  const findings = [];
  for (const rule of RULES) {
    try {
      const finding = rule(ctx);
      if (finding) findings.push(finding);
    } catch {
      // A rule that cannot analyse this input stays silent.
    }
  }
  return findings;
}
