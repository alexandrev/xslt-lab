---
title: "xsl:include"
description: "Merges another stylesheet's top-level declarations into the current stylesheet at the same import precedence."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:include href="uri"/>'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:include` incorporates the top-level declarations of another stylesheet into the including stylesheet as if they had been written there directly. Unlike `xsl:import`, the included declarations have the **same import precedence** as the declarations in the including stylesheet. This means there is no override relationship — conflicts between included and including templates follow the same conflict-resolution rules as ordinary duplicates (a processor may signal an error or choose the last declaration).

`xsl:include` is the right choice when you want to split a large stylesheet into modular files that all operate at the same level. Common patterns include separating formatting templates, utility named templates, and domain-specific rules into distinct files that are included by a master stylesheet.

`xsl:include` must appear as a top-level child of `xsl:stylesheet`, and it must appear after all `xsl:import` elements but before any templates, variable declarations, or other top-level declarations.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `href` | URI reference | Yes | Location of the stylesheet to include. Resolved relative to the including stylesheet's base URI. |

## Examples

### Modular stylesheet organisation

**utilities.xsl** (the included file):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template name="upper-first">
    <xsl:param name="text"/>
    <xsl:value-of select="concat(
      translate(substring($text,1,1),
        'abcdefghijklmnopqrstuvwxyz',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
      substring($text,2))"/>
  </xsl:template>

</xsl:stylesheet>
```

**main.xsl** (the including stylesheet):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:include href="utilities.xsl"/>

  <xsl:template match="/words">
    <result>
      <xsl:for-each select="word">
        <item>
          <xsl:call-template name="upper-first">
            <xsl:with-param name="text" select="."/>
          </xsl:call-template>
        </item>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<words>
  <word>hello</word>
  <word>world</word>
</words>
```

**Output:**
```xml
<result>
  <item>Hello</item>
  <item>World</item>
</result>
```

### Including a shared output configuration

**output-settings.xsl**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes" encoding="UTF-8"
    doctype-public="-//W3C//DTD HTML 4.01//EN"/>
</xsl:stylesheet>
```

**page.xsl**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:include href="output-settings.xsl"/>

  <xsl:template match="/page">
    <html><body><p><xsl:value-of select="."/></p></body></html>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- Circular inclusion (A includes B which includes A) is an error. Processors must detect and reject cycles.
- Because included declarations have the same precedence as the including stylesheet's own declarations, duplicate template rules may cause conflict. Use `xsl:import` if you want a clear override relationship.
- `xsl:include` is resolved at stylesheet load time, not at transformation time; the referenced URI must be accessible when the processor compiles the stylesheet.
- The included stylesheet's own `xsl:output` declarations merge with those of the including stylesheet. When there are conflicts, the `xsl:output` attribute from the stylesheet with higher import precedence wins.

## See also

- [xsl:import](../xsl-import)
- [xsl:stylesheet](../xsl-stylesheet)
