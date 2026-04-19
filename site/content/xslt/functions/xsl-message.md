---
title: "xsl:message"
description: "Emits a diagnostic message to the processor's error output; optionally terminates transformation with terminate='yes'."
date: 2026-04-19T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: "<xsl:message terminate=\"no|yes\">message content</xsl:message>"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`xsl:message` sends a diagnostic message to the XSLT processor's message destination, which is typically standard error or a log. The content of the element is a sequence constructor: any combination of literal text, value-of, elements, or other instructions that would be legal inside a template. The resulting nodes form the message.

When `terminate="yes"`, the processor stops the transformation immediately after emitting the message and reports an error. This is useful for asserting preconditions at the start of a transformation or validating input data before processing begins.

The exact format and destination of messages is implementation-defined. Saxon writes them to standard error; other processors may write to a log file or fire a callback.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `terminate` | `yes` or `no` | No | When `yes`, the processor stops the transformation after emitting the message (default `no`). |
| `select` | expression | No | XPath 2.0+ alternative to element content for specifying the message. |
| `error-code` | QName | No | XSLT 3.0. An error code attached to the message when `terminate="yes"`. |

## Return value

`xsl:message` produces no nodes in the result tree.

## Examples

### Validation guard with terminate

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<order>
  <item quantity="-3">Widget</item>
</order>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/order">
    <xsl:if test="item/@quantity &lt; 0">
      <xsl:message terminate="yes">
        ERROR: Negative quantity found for item: <xsl:value-of select="item"/>
      </xsl:message>
    </xsl:if>
    <processed><xsl:copy-of select="."/></processed>
  </xsl:template>
</xsl:stylesheet>
```

**Output (message sent to error output, transformation aborted):**
```
ERROR: Negative quantity found for item: Widget
```

### Logging progress without termination

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<records>
  <record id="1">Alpha</record>
  <record id="2">Beta</record>
  <record id="3">Gamma</record>
</records>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/records">
    <output>
      <xsl:for-each select="record">
        <xsl:message>Processing record id=<xsl:value-of select="@id"/></xsl:message>
        <item><xsl:value-of select="."/></item>
      </xsl:for-each>
    </output>
  </xsl:template>
</xsl:stylesheet>
```

**Result tree:**
```xml
<output>
  <item>Alpha</item>
  <item>Beta</item>
  <item>Gamma</item>
</output>
```

Messages `Processing record id=1`, `Processing record id=2`, and `Processing record id=3` are sent to error output.

## Notes

- The message destination is processor-dependent and cannot be configured from within the stylesheet in XSLT 1.0. Use processor-specific APIs or command-line flags to redirect messages.
- In XSLT 2.0 and later, `xsl:message` can use the `select` attribute as an alternative to element content.
- In XSLT 3.0, `terminate="yes"` combined with `error-code` allows catching the error with `try/catch` in the calling stylesheet.
- Avoid leaving `terminate="no"` messages in production stylesheets without purpose; they slow down transformation and pollute logs.

## See also

- [xsl:if](../xsl-if)
- [error()](../xpath-error)
- [trace()](../xpath-trace)
