---
title: "deep-equal()"
description: "Returns true if two sequences are deeply equal: same items in the same order with equal node identity or atomic values."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "deep-equal(sequence1, sequence2, collation?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`deep-equal()` compares two sequences item by item. Two sequences are deeply equal if they have the same length and each pair of corresponding items is deeply equal. For atomic values, deep equality uses the same comparison as `=` with type promotion. For nodes, deep equality means the nodes have the same kind, name, and — recursively — the same children, attributes, and text content.

The optional `collation` argument controls string comparison. When omitted, the default collation is used. This makes `deep-equal()` suitable for locale-aware comparisons of mixed sequences containing strings.

`deep-equal()` never raises an error for incompatible types: comparing an integer to a string returns `false` rather than a type error, which distinguishes it from the `=` operator.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence1` | item()* | Yes | The first sequence to compare. |
| `sequence2` | item()* | Yes | The second sequence to compare. |
| `collation` | xs:string | No | URI of the collation used for string comparison. |

## Return value

`xs:boolean` — `true` if the sequences are deeply equal, `false` otherwise.

## Examples

### Comparing two element subtrees

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <a><x>1</x><y>2</y></a>
  <b><x>1</x><y>2</y></b>
  <c><x>1</x><y>3</y></c>
</root>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/root">
    <results>
      <ab><xsl:value-of select="deep-equal(a, b)"/></ab>
      <ac><xsl:value-of select="deep-equal(a, c)"/></ac>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <ab>true</ab>
  <ac>false</ac>
</results>
```

### Comparing sequences of atomic values

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:variable name="s1" select="(1, 2, 3)"/>
    <xsl:variable name="s2" select="(1, 2, 3)"/>
    <xsl:variable name="s3" select="(1, 2, 4)"/>
    <xsl:value-of select="deep-equal($s1, $s2)"/><xsl:text>&#10;</xsl:text>
    <xsl:value-of select="deep-equal($s1, $s3)"/><xsl:text>&#10;</xsl:text>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
true
false
```

## Notes

- `deep-equal()` compares attributes regardless of document order for element nodes. Two elements with the same attributes in a different order are still deeply equal.
- Namespace nodes, processing instructions, and comments are included in the comparison when they are present in the node's children.
- The function is particularly useful in unit tests and validation stylesheets where you need to assert that a transformation produced an expected XML structure.
- An empty sequence is deeply equal only to another empty sequence.

## See also

- [empty()](../xpath-empty)
- [count()](../xpath-count)
- [exactly-one()](../xpath-exactly-one)
