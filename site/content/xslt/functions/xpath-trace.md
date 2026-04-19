---
title: "trace()"
description: "Emits a trace message to the processor's trace output and returns the value unchanged; used for debugging."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "trace(value, label?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`trace()` is a debugging function that sends a labeled trace message to the processor's diagnostic output, then returns its first argument unchanged. Because it is transparent with respect to the value it passes through, `trace()` can be inserted into any XPath expression without changing the expression's semantics — only the side-effect of emitting a message is added.

In XPath 2.0, the function takes two arguments: the value to trace and a string label. In XPath 3.1, the `label` argument became optional. The exact format and destination of the trace message is implementation-defined; Saxon writes to standard error with the label prepended to the value's string representation.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `value` | item()* | Yes | The value to be passed through and emitted in the trace message. |
| `label` | xs:string | Yes in 2.0, No in 3.1 | A descriptive label prepended to the trace output. |

## Return value

`item()*` — the same value as `value`, returned unchanged.

## Examples

### Tracing a variable mid-expression

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<orders>
  <order id="1" total="150"/>
  <order id="2" total="75"/>
  <order id="3" total="200"/>
</orders>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/orders">
    <result>
      <xsl:variable name="total" select="trace(sum(order/@total), 'Grand total')"/>
      <grand-total><xsl:value-of select="$total"/></grand-total>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Trace output (to stderr):**
```
Grand total: 425
```

**Result tree:**
```xml
<result>
  <grand-total>425</grand-total>
</result>
```

### Tracing selected nodes

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/orders">
    <high-value>
      <xsl:for-each select="trace(order[@total > 100], 'High-value orders')">
        <order id="{@id}"/>
      </xsl:for-each>
    </high-value>
  </xsl:template>
</xsl:stylesheet>
```

**Trace output:**
```
High-value orders: order order
```

**Result tree:**
```xml
<high-value>
  <order id="1"/>
  <order id="3"/>
</high-value>
```

## Notes

- `trace()` is purely a debugging aid; remove or comment out calls before deploying to production to avoid polluting logs.
- Because `trace()` returns its input unchanged, it can be wrapped around any sub-expression without affecting correctness.
- In XSLT 3.0, `xsl:message` with `select` is an alternative that allows richer formatting and is more visible in the stylesheet structure.
- The `label` argument was made optional in XPath 3.1; in XPath 2.0 both arguments are required.

## See also

- [xsl:message](../xsl-message)
- [error()](../xpath-error)
