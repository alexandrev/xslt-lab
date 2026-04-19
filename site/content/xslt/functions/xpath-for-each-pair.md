---
title: "for-each-pair()"
description: "Applies a binary function to corresponding items from two sequences, returning the concatenated results."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "higher-order function"
syntax: "for-each-pair(seq1, seq2, function)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`for-each-pair()` simultaneously iterates over two sequences, applying a binary function to each pair of corresponding items (first item from seq1 with first from seq2, second with second, etc.). Processing stops when the shorter sequence is exhausted.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `seq1` | item()* | Yes | The first sequence. |
| `seq2` | item()* | Yes | The second sequence. |
| `function` | function(item(), item()) as item()* | Yes | A binary function applied to each item pair. |

## Return value

`item()*` — concatenated results of applying the function to each pair; length equals `min(count(seq1), count(seq2))`.

## Examples

### Zipping two sequences into key-value pairs

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="keys"   select="('name', 'age', 'city')"/>
    <xsl:variable name="values" select="('Alice', '30', 'Paris')"/>
    <record>
      <xsl:sequence select="for-each-pair($keys, $values,
        function($k, $v) { element {$k} {$v} }
      )"/>
    </record>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<record>
  <name>Alice</name>
  <age>30</age>
  <city>Paris</city>
</record>
```

### Computing pairwise differences

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <actual>10 20 35 50</actual>
  <expected>12 18 35 48</expected>
</data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <xsl:variable name="actual"   select="for-each(tokenize(actual),   xs:integer#1)"/>
    <xsl:variable name="expected" select="for-each(tokenize(expected), xs:integer#1)"/>
    <diffs>
      <xsl:for-each select="for-each-pair($actual, $expected,
        function($a, $e) { $a - $e })">
        <diff><xsl:value-of select="."/></diff>
      </xsl:for-each>
    </diffs>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<diffs>
  <diff>-2</diff>
  <diff>2</diff>
  <diff>0</diff>
  <diff>2</diff>
</diffs>
```

## Notes

- When sequences have different lengths, the result length equals the shorter sequence — excess items from the longer sequence are ignored.
- The function must accept exactly two arguments.
- For array-based pair processing, use `array:for-each-pair()`.

## See also

- [for-each()](../xpath-for-each)
- [filter()](../xpath-filter)
- [fold-left()](../xpath-fold-left)
- [fold-right()](../xpath-fold-right)
- [array:for-each-pair()](../xpath-array-for-each-pair)
