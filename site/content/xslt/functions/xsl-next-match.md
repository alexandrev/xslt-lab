---
title: "xsl:next-match"
description: "Applies the next-priority matching template rule for the current node, passing optional parameters and tunnel parameters."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: "<xsl:next-match/>"
tags: ["xslt", "reference", "xslt2"]
---

## Description

`xsl:next-match` fires the next template rule that would have matched the current node if the current template rule did not exist. It is the XSLT 2.0 successor to `xsl:apply-imports`, but works across all templates regardless of import precedence — not only imported ones.

The "next" template is determined by priority order: templates are ranked by import precedence and then by specificity. `xsl:next-match` skips the currently executing template and invokes the one immediately below it in that ranking. If no further matching template exists, the built-in default rules apply.

This enables clean decorator-style patterns: a high-priority template handles a special case and then delegates the bulk of processing to a more generic rule.

## Parameters

`xsl:next-match` has no attributes. It may contain:

| Child element | Description |
|---------------|-------------|
| `xsl:with-param` | Passes a parameter to the next template. |
| `xsl:fallback` | Fallback content for processors that do not support `xsl:next-match`. |

## Return value

The result produced by the next matching template rule, inserted into the current output.

## Examples

### Adding a wrapper around generic output

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<doc>
  <para role="highlight">Important note.</para>
  <para>Regular paragraph.</para>
</doc>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <!-- Generic rule: all para elements -->
  <xsl:template match="para">
    <p><xsl:apply-templates/></p>
  </xsl:template>

  <!-- Specific rule: highlighted para — wraps the generic output -->
  <xsl:template match="para[@role='highlight']" priority="2">
    <div class="highlight">
      <xsl:next-match/>
    </div>
  </xsl:template>

  <xsl:template match="doc">
    <body><xsl:apply-templates/></body>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```html
<body>
  <div class="highlight"><p>Important note.</p></div>
  <p>Regular paragraph.</p>
</body>
```

### Passing a parameter to the next template

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="item" priority="2">
    <!-- Do something extra, then delegate -->
    <xsl:next-match>
      <xsl:with-param name="class" select="'special'"/>
    </xsl:next-match>
  </xsl:template>

  <xsl:template match="item">
    <xsl:param name="class" select="'normal'"/>
    <entry class="{$class}"><xsl:value-of select="."/></entry>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `xsl:next-match` differs from `xsl:apply-imports` in that it considers **all** lower-priority templates, not only those from imported stylesheets.
- It may only be used inside a template rule (`xsl:template`). Using it inside `xsl:function` is an error.
- If no further matching template exists, the built-in template rule for the node type applies (e.g., text nodes produce their string value, element nodes apply templates to children).
- Tunnel parameters passed with `xsl:with-param tunnel="yes"` flow transparently through the entire call chain.

## See also

- [xsl:apply-imports](../xsl-apply-imports)
- [xsl:apply-templates](../xsl-apply-templates)
- [xsl:fallback](../xsl-fallback)
