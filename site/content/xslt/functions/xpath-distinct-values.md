---
title: "distinct-values()"
description: "Returns a sequence containing only the distinct values from the input sequence, removing duplicates using value equality."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "distinct-values(sequence, collation?)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvcHJvZHVjdHMiPgogICAgPGNhdGVnb3JpZXM-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJkaXN0aW5jdC12YWx1ZXMocHJvZHVjdC9AY2F0ZWdvcnkpIj4KICAgICAgICA8eHNsOnNvcnQgc2VsZWN0PSIuIi8-CiAgICAgICAgPGNhdGVnb3J5Pjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIuIi8-PC9jYXRlZ29yeT4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L2NhdGVnb3JpZXM-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHByb2R1Y3RzPgogIDxwcm9kdWN0IGNhdGVnb3J5PSJGcnVpdCI-QXBwbGU8L3Byb2R1Y3Q-CiAgPHByb2R1Y3QgY2F0ZWdvcnk9IlZlZ2V0YWJsZSI-Q2Fycm90PC9wcm9kdWN0PgogIDxwcm9kdWN0IGNhdGVnb3J5PSJGcnVpdCI-QmFuYW5hPC9wcm9kdWN0PgogIDxwcm9kdWN0IGNhdGVnb3J5PSJHcmFpbiI-UmljZTwvcHJvZHVjdD4KICA8cHJvZHVjdCBjYXRlZ29yeT0iVmVnZXRhYmxlIj5Ccm9jY29saTwvcHJvZHVjdD4KICA8cHJvZHVjdCBjYXRlZ29yeT0iRnJ1aXQiPkNoZXJyeTwvcHJvZHVjdD4KPC9wcm9kdWN0cz4&version=2.0"
---

## Description

`distinct-values()` removes duplicate atomic values from a sequence, retaining one representative from each group of equal values. The order of retained values follows the order of first occurrence in the input sequence.

Equality is determined by value semantics (not identity): for strings, the default Unicode codepoint collation is used unless a different `collation` URI is provided; for numeric types, numeric equality applies (so `1` and `1.0` are equal).

The function works on atomic values only. If the input contains nodes, their typed values (strings) are compared — not the nodes themselves.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | xs:anyAtomicType* | Yes | The sequence to deduplicate. |
| `collation` | xs:string | No | A collation URI for string comparison. |

## Return value

`xs:anyAtomicType*` — the sequence with duplicates removed, preserving first-occurrence order.

## Examples

### Getting unique categories

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product category="Fruit">Apple</product>
  <product category="Vegetable">Carrot</product>
  <product category="Fruit">Banana</product>
  <product category="Grain">Rice</product>
  <product category="Vegetable">Broccoli</product>
  <product category="Fruit">Cherry</product>
</products>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/products">
    <categories>
      <xsl:for-each select="distinct-values(product/@category)">
        <xsl:sort select="."/>
        <category><xsl:value-of select="."/></category>
      </xsl:for-each>
    </categories>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<categories>
  <category>Fruit</category>
  <category>Grain</category>
  <category>Vegetable</category>
</categories>
```

### Counting unique authors across articles

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<library>
  <article author="Alice">Article 1</article>
  <article author="Bob">Article 2</article>
  <article author="Alice">Article 3</article>
  <article author="Carol">Article 4</article>
  <article author="Bob">Article 5</article>
</library>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/library">
    <xsl:variable name="unique-authors"
                  select="distinct-values(article/@author)"/>
    <stats>
      <unique-authors count="{count($unique-authors)}">
        <xsl:for-each select="$unique-authors">
          <author><xsl:value-of select="."/></author>
        </xsl:for-each>
      </unique-authors>
    </stats>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<stats>
  <unique-authors count="3">
    <author>Alice</author>
    <author>Bob</author>
    <author>Carol</author>
  </unique-authors>
</stats>
```

## Notes

- `distinct-values()` operates on atomic values, not nodes. If you apply it to element nodes, their string values are compared. If you need to group and deduplicate by element identity, use `xsl:for-each-group` with `group-by`.
- For grouping with the ability to access all members of each group, `xsl:for-each-group` is more appropriate than `distinct-values()`.
- Numeric type coercion applies: `distinct-values((1, 1.0, 1e0))` may return just one item, since all are numerically equal.
- The order of results is the order of first occurrence — it is not sorted. Add `xsl:sort` or `sort()` to sort the output.

## See also

- [xsl:for-each-group](../xsl-for-each-group)
- [index-of()](../xpath-index-of)
- [count()](../xpath-count)
