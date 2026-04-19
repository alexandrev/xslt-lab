---
title: "contains()"
description: "Returns true if the first string contains the second string as a substring, otherwise returns false."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "string function"
syntax: "contains(string, substring)"
tags: ["xslt", "reference", "xslt1", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvYXJ0aWNsZXMiPgogICAgPHhzbHQtYXJ0aWNsZXM-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJhcnRpY2xlW2NvbnRhaW5zKHRpdGxlLCAnWFNMVCcpXSI-CiAgICAgICAgPGl0ZW0-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9InRpdGxlIi8-PC9pdGVtPgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwveHNsdC1hcnRpY2xlcz4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGFydGljbGVzPgogIDxhcnRpY2xlPjx0aXRsZT5YU0xUIFR1dG9yaWFsIGZvciBCZWdpbm5lcnM8L3RpdGxlPjwvYXJ0aWNsZT4KICA8YXJ0aWNsZT48dGl0bGU-QWR2YW5jZWQgWE1MIFNjaGVtYTwvdGl0bGU-PC9hcnRpY2xlPgogIDxhcnRpY2xlPjx0aXRsZT5YU0xUIDIuMCBGZWF0dXJlczwvdGl0bGU-PC9hcnRpY2xlPgo8L2FydGljbGVzPg&version=1.0"
---

## Description

`contains()` tests whether a string includes a given substring and returns a boolean result. Both arguments are converted to strings before the comparison.

The comparison is **case-sensitive** and uses code-point ordering. If you need case-insensitive matching, use `matches()` with the `i` flag (XSLT 2.0+) or normalize both strings with `lower-case()` before comparing.

If the second argument is an empty string, `contains()` always returns `true` because every string contains the empty string.

`contains()` is frequently used inside `xsl:if` and `xsl:when` predicates to filter elements based on string content, or in predicates within XPath expressions.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string | Yes | The string to search within. |
| `substring` | xs:string | Yes | The substring to look for. |

## Return value

`xs:boolean` — `true` if `string` contains `substring`, `false` otherwise.

## Examples

### Filter elements by content

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<articles>
  <article><title>XSLT Tutorial for Beginners</title></article>
  <article><title>Advanced XML Schema</title></article>
  <article><title>XSLT 2.0 Features</title></article>
</articles>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/articles">
    <xslt-articles>
      <xsl:for-each select="article[contains(title, 'XSLT')]">
        <item><xsl:value-of select="title"/></item>
      </xsl:for-each>
    </xslt-articles>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<xslt-articles>
  <item>XSLT Tutorial for Beginners</item>
  <item>XSLT 2.0 Features</item>
</xslt-articles>
```

### Conditional processing

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/articles">
    <results>
      <xsl:for-each select="article">
        <xsl:if test="contains(title, 'XSLT')">
          <match><xsl:value-of select="title"/></match>
        </xsl:if>
      </xsl:for-each>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <match>XSLT Tutorial for Beginners</match>
  <match>XSLT 2.0 Features</match>
</results>
```

### Combined with other string functions

```xml
<!-- Check if a URL contains 'https' -->
<xsl:if test="contains(@href, 'https')">
  <xsl:attribute name="secure">true</xsl:attribute>
</xsl:if>
```

## Notes

- `contains()` is case-sensitive. For case-insensitive checks in XSLT 2.0+, use `matches(., 'pattern', 'i')` or `contains(lower-case(title), 'xslt')`.
- To check if a string **starts with** a value, use `starts-with()`. To check a suffix, use `ends-with()` (XSLT 2.0+) or `substring()`.
- `contains()` returns `true` when the substring argument is empty, which can cause unexpected results in dynamic expressions.
- For complex pattern matching (wildcards, character classes), use `matches()` instead.

## See also

- [matches()](../xpath-matches)
- [substring()](../xpath-substring)
