---
title: "resolve-QName()"
description: "Resolves a lexical QName string against the in-scope namespace bindings of a given element node."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "QName function"
syntax: "resolve-QName(lexical-qname, element)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`resolve-QName()` converts a string containing a lexical QName (such as `"xs:integer"` or `"myns:product"`) into a typed `xs:QName` value by looking up the prefix in the namespace bindings of the supplied element node. The resulting `xs:QName` carries the namespace URI associated with the prefix in that element's scope.

This function is particularly useful when an XML document stores QName-valued content as strings in attributes or text nodes — a common pattern in configuration files, WSDL documents, and schema instances. Without `resolve-QName()`, resolving the prefix to a URI requires manual namespace node traversal.

If the lexical QName has no prefix, the resulting QName has no namespace (not the default namespace). If the prefix is not declared in scope on the element, a dynamic error is raised.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lexical-qname` | xs:string? | Yes | A string containing the lexical QName to resolve. |
| `element` | element() | Yes | The element node whose in-scope namespace bindings are used for resolution. |

## Return value

`xs:QName?` — the resolved QName, or the empty sequence if `lexical-qname` is the empty sequence.

## Examples

### Resolving QName content from an attribute

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<types xmlns:xs="http://www.w3.org/2001/XMLSchema"
       xmlns:app="http://example.com/types">
  <type ref="xs:integer"/>
  <type ref="app:ProductCode"/>
</types>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/types">
    <resolved>
      <xsl:for-each select="type">
        <xsl:variable name="q" select="resolve-QName(@ref, .)"/>
        <type local="{local-name-from-QName($q)}"
              uri="{namespace-uri-from-QName($q)}"/>
      </xsl:for-each>
    </resolved>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<resolved>
  <type local="integer" uri="http://www.w3.org/2001/XMLSchema"/>
  <type local="ProductCode" uri="http://example.com/types"/>
</resolved>
```

### Comparing resolved QNames

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="text"/>

  <xsl:template match="/types">
    <xsl:variable name="first" select="resolve-QName(type[1]/@ref, type[1])"/>
    <xsl:variable name="xsInteger" select="QName('http://www.w3.org/2001/XMLSchema', 'integer')"/>
    <xsl:value-of select="if ($first eq $xsInteger) then 'Matches xs:integer' else 'Other type'"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
Matches xs:integer
```

## Notes

- The element node provides the namespace context; the QName is resolved in the namespace scope of that specific element, including inherited namespace declarations.
- A prefix that is not in scope on the supplied element raises `FOCA0002` (invalid value for cast or constructor).
- To resolve a QName using the stylesheet's own namespace bindings rather than those in the source document, construct a QName with `QName()` directly.
- `resolve-QName()` is the inverse of serializing a QName value to a prefixed string.

## See also

- [local-name-from-QName()](../xpath-local-name-from-qname)
- [namespace-uri-from-QName()](../xpath-namespace-uri-from-qname)
- [prefix-from-QName()](../xpath-prefix-from-qname)
- [QName()](../xpath-qname)
