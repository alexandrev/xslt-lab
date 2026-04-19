---
title: "xsl:sequence"
description: "Returns a sequence of items; the XSLT 2.0 equivalent of xsl:value-of for typed values and node sequences."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: '<xsl:sequence select="expression"/>'
tags: ["xslt", "reference", "xslt2"]
---

## Description

`xsl:sequence` evaluates an XPath expression and adds the resulting items — nodes, atomic values, or mixed sequences — directly to the result sequence of the current template or function. Unlike `xsl:value-of`, it preserves the type of each item: integers stay integers, nodes stay nodes, and sequences remain sequences.

It is the idiomatic way to return a value from an `xsl:function`, and the correct instruction to use when you want to pass typed data rather than a string representation.

Key differences from `xsl:value-of`:

| | `xsl:value-of` | `xsl:sequence` |
|---|---|---|
| Output | Always a text node | Items of any type |
| Types preserved | No (stringified) | Yes |
| Nodes | Copies as text | Adds as reference or copy |

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | XPath expression | Yes | The expression whose result is added to the output sequence. |

## Return value

The items produced by the `select` expression, added to the current output sequence. No wrapper node is created.

## Examples

### Returning a typed value from a function

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:my="http://example.com/my">

  <xsl:output method="xml" indent="yes"/>

  <xsl:function name="my:double" as="xs:integer">
    <xsl:param name="n" as="xs:integer"/>
    <xsl:sequence select="$n * 2"/>
  </xsl:function>

  <xsl:template match="/">
    <result>
      <xsl:value-of select="my:double(21)"/>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>42</result>
```

### Returning a node sequence

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <item status="active">Alpha</item>
  <item status="inactive">Beta</item>
  <item status="active">Gamma</item>
</catalog>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:my="http://example.com/my">

  <xsl:output method="xml" indent="yes"/>

  <xsl:function name="my:active-items" as="element()*">
    <xsl:param name="items" as="element()*"/>
    <xsl:sequence select="$items[@status='active']"/>
  </xsl:function>

  <xsl:template match="/catalog">
    <active>
      <xsl:for-each select="my:active-items(item)">
        <entry><xsl:value-of select="."/></entry>
      </xsl:for-each>
    </active>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<active>
  <entry>Alpha</entry>
  <entry>Gamma</entry>
</active>
```

## Notes

- `xsl:sequence` is the only correct way to return typed values (integers, dates, booleans) from `xsl:function`. Using `xsl:value-of` inside a function always produces a text node.
- When `select` returns nodes, they are added by reference to the sequence, not deep-copied. If you need independent copies, wrap with `copy-of()`.
- `xsl:sequence` can appear in any context where items are allowed, including inside `xsl:choose`, `xsl:if`, and `xsl:for-each`.
- An empty `xsl:sequence select="()"` adds nothing — useful as a no-op branch in a conditional.

## See also

- [xsl:value-of](../xsl-value-of)
- [xsl:result-document](../xsl-result-document)
- [xsl:function](../xsl-function)
