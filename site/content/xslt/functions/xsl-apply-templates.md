---
title: "xsl:apply-templates"
description: "Selects a set of nodes and applies the best-matching template rule to each one, enabling recursive tree processing."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:apply-templates select="node-set" mode="mode"/>'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:apply-templates` is the instruction that drives pattern-matching in XSLT. It selects a set of nodes (defaulting to all child nodes of the current node) and, for each selected node in turn, finds and instantiates the best-matching `xsl:template` rule. This is what makes XSLT processing recursive and tree-oriented.

Unlike `xsl:for-each`, which forces a fixed sequence of instructions, `xsl:apply-templates` delegates logic to templates declared elsewhere in the stylesheet (or imported stylesheets). This separation of concerns is the idiomatic XSLT approach: the calling template does not need to know how individual nodes are transformed.

The optional `mode` attribute restricts which template rules are candidates. Only templates with a matching `mode` value will fire. This allows the same source nodes to be processed differently in different phases of the transformation — for instance, building a table of contents in one mode and body content in another.

Child `xsl:sort` elements placed immediately inside `xsl:apply-templates` control the order in which selected nodes are processed without modifying the source tree.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | XPath expression | No | Nodes to process. Defaults to all child nodes (`node()`). |
| `mode` | QName | No | Restricts matching to templates with this mode. |

## Examples

### Basic recursive processing

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<menu>
  <section name="Starters">
    <item>Soup</item>
    <item>Salad</item>
  </section>
  <section name="Mains">
    <item>Steak</item>
    <item>Pasta</item>
  </section>
</menu>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/menu">
    <menu>
      <xsl:apply-templates select="section"/>
    </menu>
  </xsl:template>

  <xsl:template match="section">
    <group title="{@name}">
      <xsl:apply-templates select="item"/>
    </group>
  </xsl:template>

  <xsl:template match="item">
    <dish><xsl:value-of select="."/></dish>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<menu>
  <group title="Starters">
    <dish>Soup</dish>
    <dish>Salad</dish>
  </group>
  <group title="Mains">
    <dish>Steak</dish>
    <dish>Pasta</dish>
  </group>
</menu>
```

### Using mode to process nodes twice

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<chapters>
  <chapter><title>Introduction</title></chapter>
  <chapter><title>Core Concepts</title></chapter>
</chapters>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/chapters">
    <book>
      <toc>
        <xsl:apply-templates select="chapter" mode="toc"/>
      </toc>
      <body>
        <xsl:apply-templates select="chapter" mode="body"/>
      </body>
    </book>
  </xsl:template>

  <xsl:template match="chapter" mode="toc">
    <entry><xsl:value-of select="title"/></entry>
  </xsl:template>

  <xsl:template match="chapter" mode="body">
    <section><h1><xsl:value-of select="title"/></h1></section>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<book>
  <toc>
    <entry>Introduction</entry>
    <entry>Core Concepts</entry>
  </toc>
  <body>
    <section><h1>Introduction</h1></section>
    <section><h1>Core Concepts</h1></section>
  </body>
</book>
```

## Notes

- If no `select` is given, `xsl:apply-templates` processes all child nodes of the current node in document order, including text nodes. This can produce unexpected whitespace output; explicitly select `select="*"` to limit to element children only.
- When a selected node matches no template rule, the built-in default template fires: for element nodes it recursively applies templates to children; for text nodes it copies the text value.
- `xsl:sort` children must appear before any `xsl:with-param` children.
- Parameters can be passed to templates via child `xsl:with-param` elements; the receiving template must declare corresponding `xsl:param` elements to access them.

## See also

- [xsl:template](../xsl-template)
- [xsl:call-template](../xsl-call-template)
- [xsl:with-param](../xsl-with-param)
- [xsl:sort](../xsl-sort)
- [xsl:for-each](../xsl-for-each)
