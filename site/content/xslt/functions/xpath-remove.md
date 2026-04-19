---
title: "remove()"
description: "Returns a new sequence with the item at a specified 1-based position removed, without modifying the original sequence."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "remove(sequence, position)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0ibnVtcyIgc2VsZWN0PSIoMTAsIDIwLCAzMCwgNDAsIDUwKSIvPgogICAgPCEtLSBSZW1vdmUgaXRlbSBhdCBwb3NpdGlvbiAxIC0tPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJ0YWlsIiBzZWxlY3Q9InJlbW92ZSgkbnVtcywgMSkiLz4KICAgIDxyZXN1bHQ-CiAgICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIkdGFpbCIgc2VwYXJhdG9yPSIsICIvPgogICAgPC9yZXN1bHQ-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPG1lbnU-CiAgPGl0ZW0-SG9tZTwvaXRlbT4KICA8aXRlbT5BYm91dDwvaXRlbT4KICA8aXRlbT5CbG9nPC9pdGVtPgogIDxpdGVtPkNvbnRhY3Q8L2l0ZW0-CjwvbWVudT4&version=2.0"
---

## Description

`remove()` produces a new sequence that is identical to the input sequence except that the item at the specified 1-based `position` is omitted. Positions are 1-based. The original sequence is not modified.

If `position` is less than 1 or greater than the length of the sequence, the entire sequence is returned unchanged — no error is raised.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The source sequence. |
| `position` | xs:integer | Yes | The 1-based position of the item to remove. |

## Return value

`item()*` — the sequence with the item at `position` omitted. The length is `count($sequence) - 1` if `position` was valid.

## Examples

### Removing the first item

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="nums" select="(10, 20, 30, 40, 50)"/>
    <!-- Remove item at position 1 -->
    <xsl:variable name="tail" select="remove($nums, 1)"/>
    <result>
      <xsl:value-of select="$tail" separator=", "/>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>20, 30, 40, 50</result>
```

### Removing a specific element from a node sequence

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<menu>
  <item>Home</item>
  <item>About</item>
  <item>Blog</item>
  <item>Contact</item>
</menu>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/menu">
    <!-- Remove the 'Blog' item (position 3) -->
    <xsl:variable name="items" select="item"/>
    <xsl:variable name="filtered" select="remove($items, 3)"/>
    <nav>
      <xsl:for-each select="$filtered">
        <link><xsl:value-of select="."/></link>
      </xsl:for-each>
    </nav>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<nav>
  <link>Home</link>
  <link>About</link>
  <link>Contact</link>
</nav>
```

## Notes

- `remove()` only removes one item per call. To remove multiple items by position, chain calls or use `subsequence()` combined with sequence concatenation.
- To remove items by value rather than position, use a filter predicate: `$seq[. != $value]`.
- Out-of-range positions (< 1 or > length) are silently ignored; the full sequence is returned.
- Equivalent to `($seq[position() lt $pos], $seq[position() gt $pos])` but more readable.

## See also

- [insert-before()](../xpath-insert-before)
- [subsequence()](../xpath-subsequence)
- [index-of()](../xpath-index-of)
- [reverse()](../xpath-reverse)
