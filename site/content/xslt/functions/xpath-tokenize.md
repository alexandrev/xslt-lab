---
title: "tokenize()"
description: "Splits a string into a sequence of substrings using a regular expression as the delimiter pattern."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "string function"
syntax: "tokenize(string, pattern, flags?)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvZGF0YSI-CiAgICA8aXRlbXM-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJ0b2tlbml6ZShjc3YsICcsJykiPgogICAgICAgIDxpdGVtPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIuIi8-PC9pdGVtPgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwvaXRlbXM-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGRhdGE-CiAgPGNzdj5hcHBsZSxiYW5hbmEsY2hlcnJ5LGRhdGU8L2Nzdj4KPC9kYXRhPg&version=2.0"
---

## Description

`tokenize()` splits a string into a sequence of substrings wherever the `pattern` (a regular expression) matches. The matched delimiters are not included in the result. The function returns a sequence of `xs:string` items.

If the input string begins or ends with the delimiter pattern, the result includes an empty string at the start or end of the sequence respectively. If the input is an empty string and the pattern matches the empty string, the result is an empty sequence.

`tokenize()` is the inverse of `string-join()`: where `string-join()` assembles strings from a sequence, `tokenize()` disassembles a string into a sequence. This makes them natural complements for round-tripping delimited data.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string | Yes | The input string to split. |
| `pattern` | xs:string | Yes | A regular expression matching the delimiter. |
| `flags` | xs:string | No | Regex flags: `i` (case-insensitive), `m` (multiline), `s` (dot-all), `x` (extended). |

## Return value

`xs:string*` — a sequence of substrings split at each match of `pattern`.

## Examples

### Split a comma-separated list

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <csv>apple,banana,cherry,date</csv>
</data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <items>
      <xsl:for-each select="tokenize(csv, ',')">
        <item><xsl:value-of select="."/></item>
      </xsl:for-each>
    </items>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<items>
  <item>apple</item>
  <item>banana</item>
  <item>cherry</item>
  <item>date</item>
</items>
```

### Split on whitespace

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <words>
      <!-- \s+ matches one or more whitespace characters -->
      <xsl:for-each select="tokenize(normalize-space(csv), '\s+')">
        <word><xsl:value-of select="."/></word>
      </xsl:for-each>
    </words>
  </xsl:template>
</xsl:stylesheet>
```

### Count tokens

```xml
<!-- Count the number of comma-separated values -->
<xsl:value-of select="count(tokenize(csv, ','))"/>
```

### Access a specific token by position

```xml
<!-- Get the second CSV field -->
<xsl:value-of select="tokenize(csv, ',')[2]"/>
```

## Notes

- The `pattern` argument is a regular expression, not a plain string. Characters like `.`, `*`, `+`, `?`, `(`, `)` must be escaped with `\` if used literally (e.g., to split on a literal `.`, use `'\.'`).
- `tokenize()` returns zero or more strings; iterate the result with `xsl:for-each` or index it with `[n]`.
- If `pattern` can match an empty string (e.g., `'.*'`), Saxon raises an error — the delimiter must have non-zero length.
- For simple fixed-character splitting (comma, pipe), `tokenize()` is the idiomatic choice in XSLT 2.0+. In XSLT 1.0, use recursive named templates.

## See also

- [matches()](../xpath-matches)
- [string-join()](../xpath-string-join)
