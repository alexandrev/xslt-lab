---
title: "node-name()"
description: "Returns the name of a node as an xs:QName value, capturing both the namespace URI and the local name."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "node-name(node?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`node-name()` returns the name of an element or attribute node as an `xs:QName`. This is the typed equivalent of `name()` or `local-name()`: rather than returning a string, it returns a structured value from which you can extract the namespace URI, local name, and prefix separately.

For text nodes, comments, and document nodes, the function returns the empty sequence. When called without an argument, the context node is used.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `node` | node()? | No | The node whose name is requested. Defaults to the context node. |

## Return value

`xs:QName?` — the qualified name of the node, or the empty sequence for text, comment, and document nodes.

## Examples

### Compare node names using QName equality

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns:a="http://example.com/a" xmlns:b="http://example.com/b">
  <a:item>First</a:item>
  <b:item>Second</b:item>
</root>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:a="http://example.com/a">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/root">
    <matches>
      <xsl:for-each select="*">
        <!-- node-name() eq QName() compares namespace-aware -->
        <match name="{local-name-from-QName(node-name(.))}"
               ns="{namespace-uri-from-QName(node-name(.))}"/>
      </xsl:for-each>
    </matches>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<matches>
  <match name="item" ns="http://example.com/a"/>
  <match name="item" ns="http://example.com/b"/>
</matches>
```

### Dispatch based on qualified name

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:a="http://example.com/a">
  <xsl:output method="text"/>

  <xsl:template match="/root/*">
    <xsl:choose>
      <xsl:when test="node-name(.) eq QName('http://example.com/a', 'item')">
        <xsl:value-of select="concat('Namespace A item: ', ., '&#10;')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="concat('Other item: ', ., '&#10;')"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- Use `local-name-from-QName()`, `namespace-uri-from-QName()`, and `prefix-from-QName()` to decompose the returned `xs:QName`.
- `node-name()` is namespace-aware; for a simple string name, `name()` or `local-name()` may be sufficient.
- The prefix in the returned QName reflects the prefix used in the source document, which may differ from the prefix in the stylesheet.

## See also

- [local-name-from-QName()](../xpath-local-name-from-qname)
- [namespace-uri-from-QName()](../xpath-namespace-uri-from-qname)
- [QName()](../xpath-qname)
