---
title: "xsl:namespace"
description: "Creates a namespace node on the current element, binding a prefix to a namespace URI dynamically."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: '<xsl:namespace name="prefix" select="uri"/>'
tags: ["xslt", "reference", "xslt2"]
---

## Description

`xsl:namespace` adds a namespace node to the element being constructed. It is the programmatic equivalent of writing `xmlns:prefix="uri"` as a literal attribute, but allows the prefix and URI to be computed at runtime from XPath expressions or attribute value templates.

This is useful when generating XML that must carry specific namespace declarations, particularly when the namespace URI or prefix comes from the input data rather than being known statically.

`xsl:namespace` must appear inside a content constructor for an element — either inside a literal result element or inside `xsl:element`. It must precede any attribute or child nodes of that element.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | xs:string (AVT) | Yes | The namespace prefix to bind. Use an empty string or `#default` for the default namespace. |
| `select` | XPath expression | No | Expression evaluating to the namespace URI string. |

If `select` is omitted, the content of `xsl:namespace` is used as the namespace URI.

## Return value

A namespace node is added to the result element. No content is added to the output tree.

## Examples

### Adding a dynamic namespace declaration

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>
  <ns prefix="dc" uri="http://purl.org/dc/elements/1.1/"/>
  <ns prefix="xhtml" uri="http://www.w3.org/1999/xhtml"/>
</config>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/config">
    <root>
      <xsl:for-each select="ns">
        <xsl:namespace name="{@prefix}" select="@uri"/>
      </xsl:for-each>
      <placeholder/>
    </root>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<root xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <placeholder/>
</root>
```

### Setting a computed default namespace

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/document">
    <xsl:variable name="ns-uri" select="@targetNamespace"/>
    <xsl:element name="doc">
      <xsl:namespace name="" select="$ns-uri"/>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="*">
    <xsl:element name="{local-name()}">
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- If a namespace node for the same prefix already exists on the element with a different URI, a dynamic error is raised.
- The empty string as `name` creates or changes the default namespace (equivalent to `xmlns="..."`).
- `xsl:namespace` can only be used inside an element constructor; using it at the top level or after child elements is an error.
- In many cases, namespace declarations propagate automatically. `xsl:namespace` is needed only when the prefix or URI must be determined from data.

## See also

- [xsl:element](../xsl-element)
- [xsl:attribute](../xsl-attribute)
- [xsl:import-schema](../xsl-import-schema)
