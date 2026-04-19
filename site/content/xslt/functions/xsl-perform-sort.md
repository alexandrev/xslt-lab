---
title: "xsl:perform-sort"
description: "Sorts a sequence of items and returns the sorted sequence without iterating over it, enabling sorted results as input to other expressions."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: '<xsl:perform-sort select="sequence">'
tags: ["xslt", "reference", "xslt2"]
---

## Description

`xsl:perform-sort` sorts a sequence and produces the sorted sequence as its result. Unlike `xsl:for-each` with `xsl:sort`, it does not iterate — it simply reorders. The sorted sequence can be assigned to a variable, passed to a function, or used in any context that accepts a sequence.

This is particularly useful when you need to sort data and then use the sorted result in a further expression, such as selecting the top-N items or building a lookup.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | XPath expression | No | The sequence to sort. If omitted, the content of `xsl:perform-sort` defines the sequence via `xsl:sequence`. |

It must contain one or more `xsl:sort` children that define the sort keys.

## Return value

The items from the input sequence reordered according to the `xsl:sort` specifications.

## Examples

### Sorting and taking the top 3

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<scores>
  <score player="Alice">87</score>
  <score player="Bob">95</score>
  <score player="Carol">72</score>
  <score player="Dave">95</score>
  <score player="Eve">81</score>
</scores>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/scores">
    <xsl:variable name="sorted">
      <xsl:perform-sort select="score">
        <xsl:sort select="xs:integer(.)" order="descending"/>
        <xsl:sort select="@player"/>
      </xsl:perform-sort>
    </xsl:variable>
    <top3>
      <xsl:for-each select="$sorted/score[position() le 3]">
        <entry player="{@player}" score="{.}"/>
      </xsl:for-each>
    </top3>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<top3>
  <entry player="Bob" score="95"/>
  <entry player="Dave" score="95"/>
  <entry player="Alice" score="87"/>
</top3>
```

### Sorting inside a function

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:my="http://example.com/my">
  <xsl:output method="xml" indent="yes"/>

  <xsl:function name="my:sorted-names" as="xs:string*">
    <xsl:param name="items" as="element()*"/>
    <xsl:perform-sort select="$items/name/string()">
      <xsl:sort/>
    </xsl:perform-sort>
  </xsl:function>

  <xsl:template match="/list">
    <names>
      <xsl:for-each select="my:sorted-names(item)">
        <n><xsl:value-of select="."/></n>
      </xsl:for-each>
    </names>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `xsl:perform-sort` is not an iterator. To process each sorted item, wrap it in `xsl:for-each` or assign it to a variable.
- When `select` is omitted, the body must produce the sequence to sort using `xsl:sequence`.
- Multiple `xsl:sort` children are allowed; they define primary, secondary, and further sort keys in order.
- Sort stability: if two items compare equal on all keys, their relative order from the input is preserved (stable sort).

## See also

- [xsl:for-each](../xsl-for-each)
- [xsl:sort](../xsl-sort)
- [xsl:for-each-group](../xsl-for-each-group)
