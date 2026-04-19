---
title: "index-of()"
description: "Returns a sequence of 1-based integer positions where a value occurs in a sequence, using value equality."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "index-of(sequence, value, collation?)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDxyZXN1bHRzPgogICAgICA8IS0tIFBvc2l0aW9ucyBvZiAnQicgaW4gdGhlIHNlcXVlbmNlIC0tPgogICAgICA8eHNsOnZhcmlhYmxlIG5hbWU9InBvc2l0aW9ucyIKICAgICAgICBzZWxlY3Q9ImluZGV4LW9mKCgnQScsJ0InLCdDJywnQicsJ0QnLCdCJyksICdCJykiLz4KICAgICAgPHBvc2l0aW9ucz48eHNsOnZhbHVlLW9mIHNlbGVjdD0iJHBvc2l0aW9ucyIgc2VwYXJhdG9yPSIsICIvPjwvcG9zaXRpb25zPgogICAgICA8IS0tIEZpcnN0IG9jY3VycmVuY2UgLS0-CiAgICAgIDxmaXJzdD48eHNsOnZhbHVlLW9mIHNlbGVjdD0iJHBvc2l0aW9uc1sxXSIvPjwvZmlyc3Q-CiAgICAgIDwhLS0gQ2hlY2sgaWYgdmFsdWUgaXMgcHJlc2VudCAtLT4KICAgICAgPGZvdW5kPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJleGlzdHMoJHBvc2l0aW9ucykiLz48L2ZvdW5kPgogICAgPC9yZXN1bHRzPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNvbmZpZz4KICA8YWxsb3dlZC1mb3JtYXRzPnBkZiB4bWwgaHRtbCB0eHQ8L2FsbG93ZWQtZm9ybWF0cz4KICA8cmVxdWVzdCBmb3JtYXQ9Imh0bWwiLz4KICA8cmVxdWVzdCBmb3JtYXQ9ImRvY3giLz4KPC9jb25maWc-&version=2.0"
---

## Description

`index-of()` searches a sequence for all occurrences of a given value and returns a sequence of the 1-based positions where matches are found. If the value does not appear in the sequence, the function returns an empty sequence.

Value equality follows the same rules as the `=` operator: numeric equality for numbers, Unicode codepoint comparison for strings (unless a collation is specified), and so on. The function compares atomic values; if `sequence` contains nodes, their typed values are compared.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | xs:anyAtomicType* | Yes | The sequence to search. |
| `value` | xs:anyAtomicType | Yes | The value to look for. |
| `collation` | xs:string | No | A collation URI for string comparison. |

## Return value

`xs:integer*` — a sequence of 1-based positions where `value` equals the item in `sequence`. Returns an empty sequence if no match is found.

## Examples

### Finding where a value appears

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <results>
      <!-- Positions of 'B' in the sequence -->
      <xsl:variable name="positions"
        select="index-of(('A','B','C','B','D','B'), 'B')"/>
      <positions><xsl:value-of select="$positions" separator=", "/></positions>
      <!-- First occurrence -->
      <first><xsl:value-of select="$positions[1]"/></first>
      <!-- Check if value is present -->
      <found><xsl:value-of select="exists($positions)"/></found>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <positions>2, 4, 6</positions>
  <first>2</first>
  <found>true</found>
</results>
```

### Checking attribute value membership

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>
  <allowed-formats>pdf xml html txt</allowed-formats>
  <request format="html"/>
  <request format="docx"/>
</config>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/config">
    <xsl:variable name="formats"
      select="tokenize(allowed-formats, '\s+')"/>
    <validation>
      <xsl:for-each select="request">
        <xsl:variable name="fmt" select="@format"/>
        <request format="{$fmt}"
                 allowed="{if (exists(index-of($formats, $fmt))) then 'yes' else 'no'}"/>
      </xsl:for-each>
    </validation>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<validation>
  <request format="html" allowed="yes"/>
  <request format="docx" allowed="no"/>
</validation>
```

## Notes

- Positions are 1-based, consistent with XPath conventions (as in `position()`, `substring()`, `subsequence()`).
- For a simple membership test, the `=` operator with a sequence is often more readable: `$value = $sequence`.
- `index-of()` returns all matching positions, not just the first. Use `[1]` to get only the first.
- The function operates on atomic values. Nodes in the sequence are atomized before comparison.

## See also

- [distinct-values()](../xpath-distinct-values)
- [subsequence()](../xpath-subsequence)
- [remove()](../xpath-remove)
- [insert-before()](../xpath-insert-before)
