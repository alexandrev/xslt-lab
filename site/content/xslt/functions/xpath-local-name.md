---
title: "local-name()"
description: "Returns the local part of the expanded name of a node, stripping any namespace prefix."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "local-name(node?)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`local-name()` returns the local part of a node's name — that is, the part of the qualified name after the colon, or the full name if no prefix is present. For example, a node named `xhtml:div` has a local name of `div`.

When called without an argument, it returns the local name of the context node. When called with a node-set argument, it returns the local name of the first node in the node-set in document order. For nodes without an expanded name (such as text nodes, comments, and processing instructions with no target), the function returns the empty string `""`.

`local-name()` is useful when writing stylesheets that must process elements regardless of the namespace prefix used, or when generating output where you want to replicate element names without their prefix.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `node` | node-set | No | The node whose local name to return. Defaults to the context node. |

## Return value

`xs:string` — the local part of the node's name, or `""` for nodes with no name.

## Examples

### Print the local name of each element

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns:ns="http://example.com/ns">
  <ns:title>Main Title</ns:title>
  <ns:body>Body content</ns:body>
  <plain>Plain element</plain>
</root>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/root">
    <names>
      <xsl:for-each select="*">
        <item local="{local-name()}" qualified="{name()}"/>
      </xsl:for-each>
    </names>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<names>
  <item local="title" qualified="ns:title"/>
  <item local="body" qualified="ns:body"/>
  <item local="plain" qualified="plain"/>
</names>
```

### Generic copy stripping namespace prefixes

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data xmlns:d="http://example.com/data">
  <d:record>
    <d:field>Value</d:field>
  </d:record>
</data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="*">
    <xsl:element name="{local-name()}">
      <xsl:apply-templates select="@* | node()"/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="@*">
    <xsl:attribute name="{local-name()}">
      <xsl:value-of select="."/>
    </xsl:attribute>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<data>
  <record>
    <field>Value</field>
  </record>
</data>
```

## Notes

- For element and attribute nodes, `local-name()` returns the NCName portion after the colon. For unprefixed elements, the local name equals the qualified name.
- For text nodes, comment nodes, and document nodes, `local-name()` returns `""`.
- Processing instruction nodes return the PI target as their local name.
- `local-name()` and `name()` return the same value for nodes with no namespace prefix.
- In XSLT 2.0+, `fn:local-name()` is unchanged but also accepts a single node as argument (not a node-set); passing more than one node is an error.

## See also

- [name()](../xpath-name)
- [namespace-uri()](../xpath-namespace-uri)
