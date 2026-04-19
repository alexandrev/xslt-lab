---
title: "array:filter()"
description: "Returns a new array containing only the members for which a predicate function returns true."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:filter(array, predicate)"
tags: ["xslt", "reference", "xslt3", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiCiAgeG1sbnM6YXJyYXk9Imh0dHA6Ly93d3cudzMub3JnLzIwMDUveHBhdGgtZnVuY3Rpb25zL2FycmF5Ij4KCiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii8iPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJudW1iZXJzIiBzZWxlY3Q9IlsxLCA3LCAzLCA5LCAyLCA2LCA0LCA4XSIvPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJhYm92ZTUiIHNlbGVjdD0iYXJyYXk6ZmlsdGVyKCRudW1iZXJzLCBmdW5jdGlvbigkbikgeyAkbiBndCA1IH0pIi8-CiAgICA8cmVzdWx0PgogICAgICA8aW5wdXQtc2l6ZT48eHNsOnZhbHVlLW9mIHNlbGVjdD0iYXJyYXk6c2l6ZSgkbnVtYmVycykiLz48L2lucHV0LXNpemU-CiAgICAgIDxvdXRwdXQtc2l6ZT48eHNsOnZhbHVlLW9mIHNlbGVjdD0iYXJyYXk6c2l6ZSgkYWJvdmU1KSIvPjwvb3V0cHV0LXNpemU-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSIxIHRvIGFycmF5OnNpemUoJGFib3ZlNSkiPgogICAgICAgIDx2YWx1ZT48eHNsOnZhbHVlLW9mIHNlbGVjdD0iYXJyYXk6Z2V0KCRhYm92ZTUsIC4pIi8-PC92YWx1ZT4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L3Jlc3VsdD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGRhdGEvPg&version=3.0"
---

## Description

`array:filter()` applies a predicate function to each member of the input array and returns a new array containing only the members for which the predicate returns `true`. The order of surviving members is preserved and the original array is not modified.

The predicate is an inline or named function with signature `function(item()*) as xs:boolean`. Each member of the array—whether it is a single item or a sequence—is passed to the predicate as a whole unit.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | `array(*)` | Yes | The source array whose members are tested. |
| `predicate` | `function(item()*) as xs:boolean` | Yes | A function that returns true for members to keep. |

## Return value

`array(*)` — a new array containing only the members for which the predicate returned `true`. The size may be zero if no members pass.

## Examples

### Filtering numbers greater than 5

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data/>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="numbers" select="[1, 7, 3, 9, 2, 6, 4, 8]"/>
    <xsl:variable name="above5" select="array:filter($numbers, function($n) { $n gt 5 })"/>
    <result>
      <input-size><xsl:value-of select="array:size($numbers)"/></input-size>
      <output-size><xsl:value-of select="array:size($above5)"/></output-size>
      <xsl:for-each select="1 to array:size($above5)">
        <value><xsl:value-of select="array:get($above5, .)"/></value>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <input-size>8</input-size>
  <output-size>4</output-size>
  <value>7</value>
  <value>9</value>
  <value>6</value>
  <value>8</value>
</result>
```

### Filtering non-empty strings from an XML source

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<tags>
  <tag>xslt</tag>
  <tag/>
  <tag>xpath</tag>
  <tag>  </tag>
  <tag>saxon</tag>
</tags>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/tags">
    <xsl:variable name="all" select="array:join(for $t in tag return [$t])"/>
    <xsl:variable name="filled" select="array:filter($all, function($t) { normalize-space($t) != '' })"/>
    <filtered count="{array:size($filled)}">
      <xsl:for-each select="1 to array:size($filled)">
        <tag><xsl:value-of select="array:get($filled, .)"/></tag>
      </xsl:for-each>
    </filtered>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<filtered count="3">
  <tag>xslt</tag>
  <tag>xpath</tag>
  <tag>saxon</tag>
</filtered>
```

## Notes

- Each array member is passed as a whole unit to the predicate. A member that is itself a sequence is passed as that sequence, not as individual items.
- `array:filter()` always returns a new array; the source array is unmodified.
- To apply a transformation rather than a selection, use `array:for-each()`.
- If no member satisfies the predicate, an empty array `[]` is returned.

## See also

- [array:for-each()](../xpath-array-for-each)
- [array:fold-left()](../xpath-array-fold-left)
- [array:remove()](../xpath-array-remove)
- [array:size()](../xpath-array-size)
