---
title: "xsl:analyze-string"
description: "Processes a string against a regular expression, separating matching and non-matching substrings for independent handling."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: '<xsl:analyze-string select="string" regex="pattern" flags="flags">'
tags: ["xslt", "reference", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0iaHRtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iL2NvbW1lbnRzIj4KICAgIDxkaXY-CiAgICAgIDx4c2w6YXBwbHktdGVtcGxhdGVzIHNlbGVjdD0iY29tbWVudCIvPgogICAgPC9kaXY-CiAgPC94c2w6dGVtcGxhdGU-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9ImNvbW1lbnQiPgogICAgPHA-CiAgICAgIDx4c2w6YW5hbHl6ZS1zdHJpbmcgc2VsZWN0PSIuIiByZWdleD0iaHR0cHM_Oi8vW15cc10rIj4KICAgICAgICA8eHNsOm1hdGNoaW5nLXN1YnN0cmluZz4KICAgICAgICAgIDxhIGhyZWY9InsufSI-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Ii4iLz48L2E-CiAgICAgICAgPC94c2w6bWF0Y2hpbmctc3Vic3RyaW5nPgogICAgICAgIDx4c2w6bm9uLW1hdGNoaW5nLXN1YnN0cmluZz4KICAgICAgICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIuIi8-CiAgICAgICAgPC94c2w6bm9uLW1hdGNoaW5nLXN1YnN0cmluZz4KICAgICAgPC94c2w6YW5hbHl6ZS1zdHJpbmc-CiAgICA8L3A-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNvbW1lbnRzPgogIDxjb21tZW50PlZpc2l0IGh0dHBzOi8vZXhhbXBsZS5jb20gZm9yIGRldGFpbHMgb3IgaHR0cDovL2RvY3MuZXhhbXBsZS5vcmcvYXBpLjwvY29tbWVudD4KPC9jb21tZW50cz4&version=2.0"
---

## Description

`xsl:analyze-string` scans a string for all occurrences of a regular expression and divides the string into alternating matching and non-matching substrings. For each portion, it invokes the appropriate child element:

- `xsl:matching-substring` — processes each matched portion.
- `xsl:non-matching-substring` — processes each unmatched portion between matches.

Inside `xsl:matching-substring`, the `regex-group()` function returns captured groups from the match. The instruction processes the full string from left to right, emitting output for every segment in order.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | XPath expression | Yes | The string to analyze. |
| `regex` | xs:string (AVT) | Yes | The regular expression pattern. |
| `flags` | xs:string (AVT) | No | Flag characters: `i` (case-insensitive), `m` (multiline), `s` (dot-all), `x` (extended). |

Child elements (at least one is required):

| Child | Description |
|-------|-------------|
| `xsl:matching-substring` | Template for matched portions. |
| `xsl:non-matching-substring` | Template for non-matched portions. |
| `xsl:fallback` | Fallback for processors that do not support the instruction. |

## Return value

A sequence of nodes and/or atomic values produced by the child templates, one per substring segment.

## Examples

### Marking up URLs in plain text

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<comments>
  <comment>Visit https://example.com for details or http://docs.example.org/api.</comment>
</comments>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/comments">
    <div>
      <xsl:apply-templates select="comment"/>
    </div>
  </xsl:template>

  <xsl:template match="comment">
    <p>
      <xsl:analyze-string select="." regex="https?://[^\s]+">
        <xsl:matching-substring>
          <a href="{.}"><xsl:value-of select="."/></a>
        </xsl:matching-substring>
        <xsl:non-matching-substring>
          <xsl:value-of select="."/>
        </xsl:non-matching-substring>
      </xsl:analyze-string>
    </p>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```html
<div>
  <p>Visit <a href="https://example.com">https://example.com</a> for details or
     <a href="http://docs.example.org/api">http://docs.example.org/api</a>.</p>
</div>
```

### Parsing dates with capture groups

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<events>
  <event>Conference on 2026-04-18 in Berlin</event>
</events>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/events">
    <parsed>
      <xsl:for-each select="event">
        <xsl:analyze-string select="." regex="(\d{{4}})-(\d{{2}})-(\d{{2}})">
          <xsl:matching-substring>
            <date year="{regex-group(1)}" month="{regex-group(2)}" day="{regex-group(3)}"/>
          </xsl:matching-substring>
        </xsl:analyze-string>
      </xsl:for-each>
    </parsed>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<parsed>
  <date year="2026" month="04" day="18"/>
</parsed>
```

## Notes

- Inside attribute value templates, curly braces in the `regex` must be doubled: `\d{{4}}` to match `\d{4}`.
- Both `xsl:matching-substring` and `xsl:non-matching-substring` are optional. Omitting one effectively discards those segments.
- `regex-group(0)` returns the entire matched string; `regex-group(n)` returns the *n*th capture group.
- The instruction iterates all non-overlapping matches from left to right. If no match is found, the entire string is processed as a single non-matching substring.
- XPath regex syntax is used (XML Schema flavor), which does not support lookahead or backreferences.

## See also

- [xsl:matching-substring](../xsl-matching-substring)
- [xsl:non-matching-substring](../xsl-non-matching-substring)
- [regex-group()](../xpath-regex-group)
- [matches()](../xpath-matches)
- [replace()](../xpath-replace)
