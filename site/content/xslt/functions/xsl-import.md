---
title: "xsl:import"
description: "Imports another stylesheet at a lower import precedence, allowing the importing stylesheet to override any of its declarations."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:import href="uri"/>'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:import` brings in the top-level declarations of another stylesheet but assigns them a **lower import precedence** than the importing stylesheet's own declarations. This means that templates, variables, and other declarations in the importing stylesheet automatically override conflicting declarations from the imported stylesheet. The imported stylesheet in turn may import further stylesheets at even lower precedence.

This precedence hierarchy makes `xsl:import` the standard mechanism for stylesheet inheritance and customisation. A base library provides default behaviour; a project stylesheet imports it and overrides only the parts it needs. Inside an overriding template, `xsl:apply-imports` can call the lower-precedence (imported) version — the equivalent of `super()` in object-oriented languages.

`xsl:import` must be the first children of `xsl:stylesheet`, before any other top-level declarations, including other `xsl:import` elements from earlier imports. If multiple `xsl:import` elements exist, the one that appears last has the highest precedence among the imported stylesheets.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `href` | URI reference | Yes | Location of the stylesheet to import. Resolved relative to the importing stylesheet's base URI. |

## Examples

### Base library with override

**base.xsl** (the imported library):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template match="para">
    <p><xsl:apply-templates/></p>
  </xsl:template>

  <xsl:template match="emphasis">
    <em><xsl:apply-templates/></em>
  </xsl:template>

</xsl:stylesheet>
```

**custom.xsl** (the importing stylesheet):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="base.xsl"/>

  <xsl:output method="xml" indent="yes"/>

  <!-- Override: wrap paragraphs in a div with class -->
  <xsl:template match="para">
    <div class="para">
      <xsl:apply-imports/>
    </div>
  </xsl:template>
</xsl:stylesheet>
```

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<doc>
  <para>Hello <emphasis>world</emphasis>.</para>
</doc>
```

**Output:**
```xml
<doc>
  <div class="para"><p>Hello <em>world</em>.</p></div>
</doc>
```

### Cascading imports

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root><item>Test</item></root>
```

**layer1.xsl**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="item"><span><xsl:value-of select="."/></span></xsl:template>
</xsl:stylesheet>
```

**layer2.xsl** (imports layer1, overrides item):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="layer1.xsl"/>
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/root">
    <ul><xsl:apply-templates select="item"/></ul>
  </xsl:template>

  <xsl:template match="item">
    <li><xsl:apply-imports/></li>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<ul>
  <li><span>Test</span></li>
</ul>
```

## Notes

- `xsl:import` elements must precede all other top-level children. Placing them after any template, variable, or `xsl:output` declaration is an error.
- Circular imports are forbidden and must be detected by the processor.
- `xsl:apply-imports` can only be used inside a template that has overridden an imported template; it calls the best-matching template at a lower import precedence.
- Multiple `xsl:import` elements are evaluated so that the last listed `xsl:import` has the highest precedence among the imported stylesheets (but still lower than the importing stylesheet itself).

## See also

- [xsl:include](../xsl-include)
- [xsl:stylesheet](../xsl-stylesheet)
- [xsl:apply-templates](../xsl-apply-templates)
