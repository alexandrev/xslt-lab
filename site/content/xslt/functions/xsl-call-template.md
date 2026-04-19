---
title: "xsl:call-template"
description: "Invokes a named template by name, optionally passing parameters, without changing the current context node."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:call-template name="name"/>'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:call-template` invokes a template that was declared with the `name` attribute on `xsl:template`. Unlike `xsl:apply-templates`, which selects nodes and fires matching rules, `xsl:call-template` is a direct, unconditional call — similar to a function call in a procedural language. The context node, position, and size remain exactly what they were in the calling template; the named template operates in that same context.

Named templates serve as reusable subroutines in XSLT. Because XSLT variables are immutable, the primary technique for producing loops or accumulations is recursive named-template calls, where each invocation passes updated values via `xsl:with-param`.

Parameters are passed via child `xsl:with-param` elements. Inside the named template, `xsl:param` elements declare the expected parameters and provide default values. If a `with-param` element supplies a value, it overrides the default.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | QName | Yes | The name of the template to call. Must match the `name` attribute of an `xsl:template` in scope. |

## Examples

### Reusable formatting template

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report>
  <product name="Alpha" price="1200"/>
  <product name="Beta" price="450"/>
  <product name="Gamma" price="89"/>
</report>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template name="format-currency">
    <xsl:param name="amount"/>
    <xsl:text>$</xsl:text>
    <xsl:value-of select="format-number($amount, '#,##0.00')"/>
  </xsl:template>

  <xsl:template match="/report">
    <prices>
      <xsl:for-each select="product">
        <row>
          <name><xsl:value-of select="@name"/></name>
          <price>
            <xsl:call-template name="format-currency">
              <xsl:with-param name="amount" select="@price"/>
            </xsl:call-template>
          </price>
        </row>
      </xsl:for-each>
    </prices>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<prices>
  <row><name>Alpha</name><price>$1,200.00</price></row>
  <row><name>Beta</name><price>$450.00</price></row>
  <row><name>Gamma</name><price>$89.00</price></row>
</prices>
```

### Recursive call for string padding

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<label>Warning</label>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template name="pad-right">
    <xsl:param name="str"/>
    <xsl:param name="width" select="20"/>
    <xsl:param name="char" select="'.'"/>
    <xsl:value-of select="$str"/>
    <xsl:if test="string-length($str) &lt; $width">
      <xsl:call-template name="pad-right">
        <xsl:with-param name="str" select="concat($str, $char)"/>
        <xsl:with-param name="width" select="$width"/>
        <xsl:with-param name="char" select="$char"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <xsl:template match="/label">
    <xsl:call-template name="pad-right">
      <xsl:with-param name="str" select="."/>
    </xsl:call-template>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
Warning.............
```

## Notes

- The named template must be resolvable at compile time; forward references are allowed — template order in the file does not matter.
- The context node inside the called template is the same as in the caller. Use `xsl:with-param` to pass node-set context explicitly if needed.
- A named template can also have a `match` attribute, making it both callable by name and matchable by pattern.
- Recursive calls are the standard XSLT 1.0 technique for iteration, but deep recursion can overflow the processor's stack. For large counts, consider chunk-based recursion strategies.

## See also

- [xsl:template](../xsl-template)
- [xsl:apply-templates](../xsl-apply-templates)
- [xsl:with-param](../xsl-with-param)
- [xsl:param](../xsl-param)
