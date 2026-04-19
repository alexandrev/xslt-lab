---
title: "xsl:variable"
description: "Binds a name to a value or node-set for the duration of the enclosing scope; XSLT variables are immutable once set."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:variable name="name" select="expression" as="type"/>'
tags: ["xslt", "reference", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvY2FydCI-CiAgICA8aW52b2ljZT4KICAgICAgPHhzbDphcHBseS10ZW1wbGF0ZXMgc2VsZWN0PSJpdGVtIi8-CiAgICA8L2ludm9pY2U-CiAgPC94c2w6dGVtcGxhdGU-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Iml0ZW0iPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJzdWJ0b3RhbCIgc2VsZWN0PSJAcHJpY2UgKiBAcXR5Ii8-CiAgICA8bGluZT4KICAgICAgPG5hbWU-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Ii4iLz48L25hbWU-CiAgICAgIDxzdWJ0b3RhbD48eHNsOnZhbHVlLW9mIHNlbGVjdD0iZm9ybWF0LW51bWJlcigkc3VidG90YWwsICcjMC4wMCcpIi8-PC9zdWJ0b3RhbD4KICAgIDwvbGluZT4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNhcnQ-CiAgPGl0ZW0gcHJpY2U9IjEyLjUwIiBxdHk9IjMiPldpZGdldDwvaXRlbT4KICA8aXRlbSBwcmljZT0iNS4wMCIgcXR5PSIxMCI-Qm9sdDwvaXRlbT4KPC9jYXJ0Pg&version=1.0"
---

## Description

`xsl:variable` binds a name to a computed value. Once the binding is established it cannot be changed — XSLT variables are constants in the sense that reassignment is not possible. This immutability is a fundamental design decision that enables the functional, side-effect-free processing model of XSLT.

A variable can be declared at two levels:

- **Top-level** (direct child of `xsl:stylesheet`): the variable is global and visible in all templates throughout the stylesheet and any included or importing stylesheets.
- **Inside a template**: the variable is local and visible only in the subsequent siblings and their descendants within the same template scope.

The value of a variable is determined either by the `select` attribute (an XPath expression) or by the element's content. If neither is present, the variable has an empty string value. If both are present, it is an error.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | QName | Yes | The variable name, referenced in XPath as `$name`. |
| `select` | XPath expression | No | Expression whose value becomes the variable's value. Mutually exclusive with element content. |
| `as` | SequenceType | No | (2.0+) Declares the expected type; triggers a type error if the value does not match. |

## Examples

### Local variable for intermediate computation

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<cart>
  <item price="12.50" qty="3">Widget</item>
  <item price="5.00" qty="10">Bolt</item>
</cart>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/cart">
    <invoice>
      <xsl:apply-templates select="item"/>
    </invoice>
  </xsl:template>

  <xsl:template match="item">
    <xsl:variable name="subtotal" select="@price * @qty"/>
    <line>
      <name><xsl:value-of select="."/></name>
      <subtotal><xsl:value-of select="format-number($subtotal, '#0.00')"/></subtotal>
    </line>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<invoice>
  <line><name>Widget</name><subtotal>37.50</subtotal></line>
  <line><name>Bolt</name><subtotal>50.00</subtotal></line>
</invoice>
```

### Global variable and content-based variable

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<document><title>Annual Report</title><year>2025</year></document>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:variable name="company">Acme Corp</xsl:variable>

  <xsl:template match="/document">
    <xsl:variable name="heading" select="concat(title, ' — ', $company, ' ', year)"/>
    <report>
      <heading><xsl:value-of select="$heading"/></heading>
    </report>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<report>
  <heading>Annual Report — Acme Corp 2025</heading>
</report>
```

## Notes

- A local `xsl:variable` does not shadow or override a global variable of the same name within the current scope; it creates a new binding that takes precedence locally.
- Because variables are immutable, the common pattern for conditional assignment is `xsl:choose` inside a content-based variable declaration.
- Circular variable references (a global variable referencing itself) are an error.
- In XSLT 1.0, a content-based variable that produces a result tree fragment (RTF) can only be used with `string()`, `boolean()`, `number()`, or passed to `xsl:copy-of`. To use it as a node-set, you need the `node-set()` extension function (e.g., `exsl:node-set()`).

## See also

- [xsl:param](../xsl-param)
- [xsl:with-param](../xsl-with-param)
