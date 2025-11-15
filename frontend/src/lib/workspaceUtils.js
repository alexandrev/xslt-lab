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
  return result.replace(
    /[ \t]*<xsl:param\b[^>]*?(?:\/>|>[\s\S]*?<\/xsl:param>)[ \t]*(?:\r?\n)?/g,
    "",
  );
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
  const clean = getParamBlock(text);
  const names = new Set();
  const regex = /<xsl:param[^>]*name="([^"]+)"[^>]*>/g;
  let m;
  while ((m = regex.exec(clean))) {
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
