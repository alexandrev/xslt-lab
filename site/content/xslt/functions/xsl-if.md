---
title: "xsl:if"
description: "Conditionally outputs content when a boolean XPath expression evaluates to true; has no else branch."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:if test="boolean-expression">'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:if` evaluates the XPath expression in its `test` attribute and instantiates its content only when the result is true (or converts to boolean true). When the expression is false, the element and all its children are silently skipped — no output is produced.

Because `xsl:if` has no else branch, use `xsl:choose` with `xsl:when` and `xsl:otherwise` when you need to handle two or more mutually exclusive cases. For a simple true/false toggle, `xsl:if` is more concise and readable.

The `test` expression is evaluated in the current context and can reference context-node content, positional functions like `position()` and `last()`, variables, and any XPath 1.0 expression. Non-boolean results are coerced to boolean according to XPath rules: a non-empty node-set is true, a non-zero number is true, and a non-empty string is true.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `test` | Boolean XPath expression | Yes | Expression that controls whether the content is output. |

## Examples

### Conditional row class

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<items>
  <item id="1" stock="5">Widget</item>
  <item id="2" stock="0">Gadget</item>
  <item id="3" stock="12">Doohickey</item>
</items>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/items">
    <table>
      <xsl:apply-templates select="item"/>
    </table>
  </xsl:template>

  <xsl:template match="item">
    <row>
      <xsl:if test="@stock = 0">
        <xsl:attribute name="class">out-of-stock</xsl:attribute>
      </xsl:if>
      <name><xsl:value-of select="."/></name>
      <stock><xsl:value-of select="@stock"/></stock>
    </row>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<table>
  <row><name>Widget</name><stock>5</stock></row>
  <row class="out-of-stock"><name>Gadget</name><stock>0</stock></row>
  <row><name>Doohickey</name><stock>12</stock></row>
</table>
```

### Alternate row separator

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<colors>
  <color>Red</color>
  <color>Green</color>
  <color>Blue</color>
</colors>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/colors">
    <xsl:for-each select="color">
      <xsl:if test="position() > 1">
        <xsl:text>, </xsl:text>
      </xsl:if>
      <xsl:value-of select="."/>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
Red, Green, Blue
```

## Notes

- `xsl:if` cannot appear at the top level of a stylesheet; it is only valid inside a template body.
- An empty node-set converts to boolean `false`, so `<xsl:if test="element-name">` is a safe existence check.
- Comparing a missing attribute to a value (e.g., `@attr = 'x'`) returns `false` rather than raising an error, because the attribute node-set is empty.
- For multiple exclusive branches, use `xsl:choose` instead of chaining several `xsl:if` elements — the latter evaluates all conditions independently, which is rarely the desired behaviour.

## See also

- [xsl:choose](../xsl-choose)
- [xsl:when](../xsl-when)
- [xsl:otherwise](../xsl-otherwise)
