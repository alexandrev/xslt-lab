---
title: "current-grouping-key()"
description: "Returns the grouping key of the current group inside an xsl:for-each-group instruction."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "current-grouping-key()"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`current-grouping-key()` returns the value of the grouping key for the current group within an `<xsl:for-each-group>` instruction. The type and value of the key corresponds to the result of evaluating the `group-by`, `group-adjacent`, `group-starting-with`, or `group-ending-with` attribute for the representative item of the current group.

It is only meaningful inside `xsl:for-each-group`. Outside that instruction, the result is implementation-defined.

## Parameters

This function takes no parameters.

## Return value

`xs:anyAtomicType?` — the grouping key of the current group, or the empty sequence when used with `group-starting-with` or `group-ending-with`.

## Examples

### Group and label by category

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product category="electronics" name="Tablet"/>
  <product category="books" name="XSLT Guide"/>
  <product category="electronics" name="Laptop"/>
  <product category="books" name="XML Handbook"/>
</products>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/products">
    <catalog>
      <xsl:for-each-group select="product" group-by="@category">
        <xsl:sort select="current-grouping-key()"/>
        <category id="{current-grouping-key()}">
          <xsl:for-each select="current-group()">
            <item><xsl:value-of select="@name"/></item>
          </xsl:for-each>
        </category>
      </xsl:for-each-group>
    </catalog>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<catalog>
  <category id="books">
    <item>XSLT Guide</item>
    <item>XML Handbook</item>
  </category>
  <category id="electronics">
    <item>Tablet</item>
    <item>Laptop</item>
  </category>
</catalog>
```

### Use the grouping key in a heading

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/products">
    <html><body>
      <xsl:for-each-group select="product" group-by="@category">
        <h2><xsl:value-of select="current-grouping-key()"/></h2>
        <ul>
          <xsl:for-each select="current-group()">
            <li><xsl:value-of select="@name"/></li>
          </xsl:for-each>
        </ul>
      </xsl:for-each-group>
    </body></html>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- For `group-starting-with` and `group-ending-with`, `current-grouping-key()` returns the empty sequence because these grouping methods do not use a key expression.
- `current-grouping-key()` is only valid inside `xsl:for-each-group`. Using it elsewhere is an error.
- When multiple keys are produced by a sequence-valued `group-by`, the key for the current group is the specific value that identified this group.

## See also

- [current-group()](../xpath-current-group)
- [xsl:for-each-group](../xsl-for-each-group)
