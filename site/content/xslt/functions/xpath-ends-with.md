---
title: "ends-with()"
description: "Returns true if the first string ends with the second string, using optional collation for comparison."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "string function"
syntax: "ends-with(string, suffix)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvZmlsZXMiPgogICAgPHBkZi1maWxlcz4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9ImZpbGVbZW5kcy13aXRoKC4sICcucGRmJyldIj4KICAgICAgICA8ZmlsZT48eHNsOnZhbHVlLW9mIHNlbGVjdD0iLiIvPjwvZmlsZT4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L3BkZi1maWxlcz4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGZpbGVzPgogIDxmaWxlPnJlcG9ydC5wZGY8L2ZpbGU-CiAgPGZpbGU-ZGF0YS54bWw8L2ZpbGU-CiAgPGZpbGU-c3VtbWFyeS5wZGY8L2ZpbGU-CiAgPGZpbGU-c3R5bGVzaGVldC54c2w8L2ZpbGU-CiAgPGZpbGU-bm90ZXMudHh0PC9maWxlPgo8L2ZpbGVzPg&version=2.0"
---

## Description

`ends-with()` tests whether the string in the first argument ends with the string in the second argument. It returns `true` if the suffix matches, `false` otherwise.

The comparison uses codepoint-by-codepoint equality by default (same as XPath's `=` operator on strings). In XPath 2.0 a third `collation` argument is allowed for locale-sensitive suffix testing, though most processors default to the Unicode codepoint collation.

If either argument is an empty string `""`, special rules apply: any string ends with `""` (always `true`), and `""` ends with `""` (also `true`).

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string? | Yes | The string to test. |
| `suffix` | xs:string? | Yes | The suffix to look for at the end of `string`. |

## Return value

`xs:boolean` — `true` if `string` ends with `suffix`, `false` otherwise.

## Examples

### Filtering files by extension

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<files>
  <file>report.pdf</file>
  <file>data.xml</file>
  <file>summary.pdf</file>
  <file>stylesheet.xsl</file>
  <file>notes.txt</file>
</files>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/files">
    <pdf-files>
      <xsl:for-each select="file[ends-with(., '.pdf')]">
        <file><xsl:value-of select="."/></file>
      </xsl:for-each>
    </pdf-files>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<pdf-files>
  <file>report.pdf</file>
  <file>summary.pdf</file>
</pdf-files>
```

### Checking namespace URIs

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/namespaces">
    <xhtml-ns>
      <!-- Select namespace nodes whose URI ends with 'xhtml' -->
      <xsl:for-each select="ns[ends-with(@uri, 'xhtml')]">
        <match prefix="{@prefix}" uri="{@uri}"/>
      </xsl:for-each>
    </xhtml-ns>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `ends-with()` was introduced in XPath 2.0. In XPath 1.0 there is no built-in equivalent; the workaround is `substring($s, string-length($s) - string-length($suffix) + 1) = $suffix`.
- The comparison is case-sensitive by default. For case-insensitive suffix testing, normalize both strings with `lower-case()` first.
- An empty `suffix` always returns `true`. An empty `string` with a non-empty `suffix` returns `false`.
- `starts-with()` (available in both XPath 1.0 and 2.0) is the complementary function for prefix testing.

## See also

- [starts-with()](../xpath-starts-with)
- [contains()](../xpath-contains)
- [substring()](../xpath-substring)
- [lower-case()](../xpath-lower-case)
