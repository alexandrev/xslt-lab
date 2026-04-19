---
title: "subsequence()"
description: "Returns a contiguous subsequence of items starting at a 1-based position."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "subsequence(sequence, startingLoc, length?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnBhcmFtIG5hbWU9InBhZ2UiIHNlbGVjdD0ieHM6aW50ZWdlcigyKSIvPgogIDx4c2w6cGFyYW0gbmFtZT0icGFnZVNpemUiIHNlbGVjdD0ieHM6aW50ZWdlcigzKSIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvaXRlbXMiPgogICAgPHBhZ2UgbnVtYmVyPSJ7JHBhZ2V9Ij4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9InN1YnNlcXVlbmNlKGl0ZW0sICgkcGFnZSAtIDEpICogJHBhZ2VTaXplICsgMSwgJHBhZ2VTaXplKSI-CiAgICAgICAgPGl0ZW0-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Ii4iLz48L2l0ZW0-CiAgICAgIDwveHNsOmZvci1lYWNoPgogICAgPC9wYWdlPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGl0ZW1zPgogIDxpdGVtPkE8L2l0ZW0-PGl0ZW0-QjwvaXRlbT48aXRlbT5DPC9pdGVtPgogIDxpdGVtPkQ8L2l0ZW0-PGl0ZW0-RTwvaXRlbT48aXRlbT5GPC9pdGVtPgogIDxpdGVtPkc8L2l0ZW0-PGl0ZW0-SDwvaXRlbT48aXRlbT5JPC9pdGVtPgo8L2l0ZW1zPg&version=2.0"
---

## Description

`subsequence()` extracts a contiguous run of items from a sequence. The `startingLoc` parameter is 1-based: position 1 is the first item. If `length` is supplied, at most that many items are returned. If `length` is omitted, all items from `startingLoc` to the end of the sequence are returned.

Positions outside the sequence bounds are handled gracefully: if `startingLoc` is less than 1 it is treated as 1; if `startingLoc` is beyond the end of the sequence the result is the empty sequence; if `length` would extend beyond the end of the sequence, only the available items are returned.

`subsequence()` is the idiomatic XPath 2.0 alternative to the XSLT 1.0 `position()` and `last()` workaround, and is more readable than `$seq[position() ge $start and position() le $start + $len - 1]`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The source sequence. |
| `startingLoc` | xs:double | Yes | 1-based starting position. Values less than 1 are treated as 1. |
| `length` | xs:double | No | Maximum number of items to return. Omit to return all remaining items. |

## Return value

`item()*` — the selected contiguous subsequence, or the empty sequence if no items qualify.

## Examples

### Pagination: extracting a page of results

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<items>
  <item>A</item><item>B</item><item>C</item>
  <item>D</item><item>E</item><item>F</item>
  <item>G</item><item>H</item><item>I</item>
</items>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:param name="page" select="xs:integer(2)"/>
  <xsl:param name="pageSize" select="xs:integer(3)"/>

  <xsl:template match="/items">
    <page number="{$page}">
      <xsl:for-each select="subsequence(item, ($page - 1) * $pageSize + 1, $pageSize)">
        <item><xsl:value-of select="."/></item>
      </xsl:for-each>
    </page>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<page number="2">
  <item>D</item>
  <item>E</item>
  <item>F</item>
</page>
```

### Taking the first N items

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/items">
    <top3>
      <xsl:copy-of select="subsequence(item, 1, 3)"/>
    </top3>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<top3>
  <item>A</item>
  <item>B</item>
  <item>C</item>
</top3>
```

## Notes

- The `startingLoc` and `length` parameters are `xs:double` rather than integer, which means `NaN`, `INF`, and fractional values are accepted. Fractional values are rounded to the nearest integer using round-half-to-even.
- `subsequence($seq, 1)` is equivalent to `$seq` itself.
- `subsequence($seq, 2)` removes the first item, equivalent to `tail($seq)` which is available in XPath 3.0.
- For very large sequences, processors may optimize `subsequence()` to avoid materializing the entire sequence.

## See also

- [reverse()](../xpath-reverse)
- [unordered()](../xpath-unordered)
- [insert-before()](../xpath-insert-before)
- [remove()](../xpath-remove)
