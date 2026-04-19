---
title: "xsl:template"
description: "Defines a template rule that fires when a node matches a pattern, or a named template that can be called explicitly."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:template match="pattern" name="name" mode="mode" priority="number">'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:template` is the central building block of every XSLT stylesheet. It defines a reusable chunk of transformation logic that is either matched automatically by the XSLT processor when it encounters nodes of a certain type, or called explicitly by name from other templates.

A template with a `match` attribute is a **template rule**. The processor evaluates the match pattern against nodes in the source tree and fires the template when a node matches. Patterns follow XPath abbreviated syntax with restrictions: only the child and attribute axes, predicates, and node tests are allowed — not full XPath expressions.

A template with only a `name` attribute is a **named template**, similar to a function or subroutine. It is never fired automatically; it must be called with `xsl:call-template`. A template may have both `match` and `name`, making it both matchable and callable.

The `mode` attribute allows the same source node to be processed by different templates in different contexts — for example, once to build a table of contents and again to build the body text. Templates with `mode` can only be activated by `xsl:apply-templates` with the same `mode` value.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `match` | Pattern | Conditional | XPath pattern that nodes must satisfy. Required unless `name` is present. |
| `name` | QName | Conditional | Unique name for calling via `xsl:call-template`. Required unless `match` is present. |
| `mode` | QName | No | Named processing mode; restricts when the template fires. |
| `priority` | number | No | Explicit conflict-resolution priority. Higher number wins. |

## Examples

### Match-based template rule

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<library>
  <book><title>Clean Code</title><year>2008</year></book>
  <book><title>Refactoring</title><year>1999</year></book>
</library>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/library">
    <books>
      <xsl:apply-templates select="book"/>
    </books>
  </xsl:template>

  <xsl:template match="book">
    <item year="{year}">
      <xsl:value-of select="title"/>
    </item>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<books>
  <item year="2008">Clean Code</item>
  <item year="1999">Refactoring</item>
</books>
```

### Named template with parameters

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data><value>7</value></data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template name="repeat">
    <xsl:param name="text"/>
    <xsl:param name="count"/>
    <xsl:if test="$count > 0">
      <xsl:value-of select="$text"/>
      <xsl:call-template name="repeat">
        <xsl:with-param name="text" select="$text"/>
        <xsl:with-param name="count" select="$count - 1"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <xsl:template match="/data">
    <xsl:call-template name="repeat">
      <xsl:with-param name="text">*</xsl:with-param>
      <xsl:with-param name="count" select="value"/>
    </xsl:call-template>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
*******
```

## Notes

- When two template rules match the same node, the processor uses conflict resolution: higher `priority` wins. If priorities are equal, the template with the more specific pattern wins (attribute patterns beat element patterns beat wildcard patterns). If still ambiguous, the processor may signal an error or pick the last declared template.
- Default built-in templates exist for every node type. For element and root nodes they recursively apply templates; for text and attribute nodes they copy the string value; for comments and processing instructions they produce nothing.
- The `mode` attribute value `#all` (XSLT 2.0+) matches in any mode; in XSLT 1.0 mode names must be an ordinary QName.
- Named templates do not have a `match` pattern, so they have no context node unless one is established by the caller.

## See also

- [xsl:apply-templates](../xsl-apply-templates)
- [xsl:call-template](../xsl-call-template)
- [xsl:with-param](../xsl-with-param)
- [xsl:param](../xsl-param)
