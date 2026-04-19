---
title: "xsl:fallback"
description: "Provides fallback content to execute when an enclosing extension element or unrecognised instruction is not supported by the processor."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: "<xsl:fallback>"
tags: ["xslt", "reference", "xslt2"]
---

## Description

`xsl:fallback` supplies an alternative sequence constructor that a conformant processor must use when it encounters an enclosing instruction it does not recognise or does not support. This allows stylesheets to use extension elements or forward-compatible XSLT features while gracefully degrading for processors that lack the capability.

`xsl:fallback` must appear as a direct child of an extension element (an element in a non-XSLT, non-literal-result namespace) or of an XSLT instruction that may not be supported (e.g., `xsl:next-match` in a 1.0 processor). Multiple `xsl:fallback` children may be present; if the enclosing instruction is unsupported, all of them are instantiated in document order.

If the enclosing instruction **is** supported, `xsl:fallback` is silently ignored.

## Parameters

`xsl:fallback` has no attributes. It contains a sequence constructor.

## Return value

The result of the sequence constructor inside `xsl:fallback`, produced when the enclosing instruction is not supported.

## Examples

### Fallback for an XSLT 2.0 instruction in a 1.0 context

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="para[@role='special']">
    <xsl:next-match>
      <xsl:fallback>
        <!-- XSLT 1.0 processors: fall back to apply-imports -->
        <xsl:apply-imports/>
      </xsl:fallback>
    </xsl:next-match>
  </xsl:template>

  <xsl:template match="para">
    <p><xsl:apply-templates/></p>
  </xsl:template>
</xsl:stylesheet>
```

### Fallback for a vendor extension element

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:vendor="http://vendor.example.com/xslt"
  extension-element-prefixes="vendor">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/report">
    <output>
      <!-- Try vendor-specific PDF rendering -->
      <vendor:render-pdf quality="high">
        <xsl:apply-templates/>
        <xsl:fallback>
          <!-- For processors without the extension, produce plain XML -->
          <xsl:message>vendor:render-pdf not supported; using plain output.</xsl:message>
          <xsl:apply-templates/>
        </xsl:fallback>
      </vendor:render-pdf>
    </output>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `xsl:fallback` is evaluated only when the enclosing instruction is **not** supported. If the instruction succeeds normally, the fallback is skipped entirely.
- An XSLT processor that encounters an unsupported instruction without an `xsl:fallback` child must raise a dynamic error.
- In forward-compatible mode (`version` attribute higher than the processor's version), unrecognised instructions are treated as extension elements and `xsl:fallback` is invoked if present.
- `xsl:fallback` cannot be used as a standalone instruction outside an extension or forward-compatible element context.

## See also

- [xsl:next-match](../xsl-next-match)
- [xsl:apply-imports](../xsl-apply-imports)
- [xsl:message](../xsl-message)
