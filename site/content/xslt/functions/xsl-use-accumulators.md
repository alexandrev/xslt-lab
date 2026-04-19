---
title: "xsl:use-accumulators"
description: "Declares which accumulators are active for a streaming template or mode, enabling the processor to compute only necessary values."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:use-accumulators value=\"accumulator-name-list\"/>"
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:use-accumulators` is an attribute (expressed as a pseudo-element in older descriptions, but in current XSLT 3.0 it is an attribute on `xsl:template` or `xsl:mode`) that lists the accumulators that should be active while processing a streaming template. When streaming is in use, the XSLT processor cannot maintain all accumulators simultaneously because it processes nodes in document order without storing the full tree. Declaring which accumulators are needed allows the processor to activate only those, reducing memory and processing overhead.

In practice, `xsl:use-accumulators` appears as the `use-accumulators` attribute on an `xsl:template` or `xsl:mode` element. The value is a whitespace-separated list of accumulator names (QNames). Only accumulators listed here are guaranteed to return meaningful values via `accumulator-before()` and `accumulator-after()` within the template's scope.

If `use-accumulators` is absent on a streaming template, no accumulators are active by default. In non-streaming stylesheets, all accumulators defined in the stylesheet are available without declaring them.

## Parameters

| Attribute | Context | Type | Description |
|-----------|---------|------|-------------|
| `use-accumulators` | `xsl:template` or `xsl:mode` | `xs:QName*` whitespace-separated | Names of accumulators to activate for this template or mode. |

## Return value

`xsl:use-accumulators` is a declaration attribute; it produces no XDM value.

## Examples

### Streaming a large document and reading a running total accumulator

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <!-- Define an accumulator that sums sale amounts -->
  <xsl:accumulator name="running-total" as="xs:decimal" initial-value="0">
    <xsl:accumulator-rule match="sale" select="$value + xs:decimal(@amount)"/>
  </xsl:accumulator>

  <!-- Streaming template: declare which accumulators are needed -->
  <xsl:template match="/" use-accumulators="running-total">
    <xsl:source-document streamable="yes" href="sales.xml">
      <report>
        <xsl:apply-templates select="sales/sale"/>
        <total><xsl:value-of select="accumulator-after('running-total')"/></total>
      </report>
    </xsl:source-document>
  </xsl:template>

  <xsl:template match="sale" use-accumulators="running-total">
    <sale amount="{@amount}"
          running="{accumulator-after('running-total')}"/>
  </xsl:template>
</xsl:stylesheet>
```

**Input XML (`sales.xml`):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sales>
  <sale amount="100.00"/>
  <sale amount="250.50"/>
  <sale amount="75.25"/>
</sales>
```

**Output:**
```xml
<report>
  <sale amount="100.00" running="100.00"/>
  <sale amount="250.50" running="350.50"/>
  <sale amount="75.25" running="425.75"/>
  <total>425.75</total>
</report>
```

### Using multiple accumulators in a streaming mode

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:accumulator name="item-count" as="xs:integer" initial-value="0">
    <xsl:accumulator-rule match="item" select="$value + 1"/>
  </xsl:accumulator>

  <xsl:accumulator name="total-price" as="xs:decimal" initial-value="0">
    <xsl:accumulator-rule match="item" select="$value + xs:decimal(@price)"/>
  </xsl:accumulator>

  <!-- Activate both accumulators for this streaming mode -->
  <xsl:mode name="stream-mode" streamable="yes"
            use-accumulators="item-count total-price"/>

  <xsl:template match="/" use-accumulators="item-count total-price">
    <xsl:source-document streamable="yes" href="order.xml">
      <xsl:apply-templates select="order" mode="stream-mode"/>
    </xsl:source-document>
  </xsl:template>

  <xsl:template match="order" mode="stream-mode">
    <summary>
      <count><xsl:value-of select="accumulator-after('item-count')"/></count>
      <total><xsl:value-of select="accumulator-after('total-price')"/></total>
    </summary>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<summary>
  <count>3</count>
  <total>435.75</total>
</summary>
```

## Notes

- `use-accumulators` is only required (and only meaningful) in streaming contexts. In non-streaming stylesheets, all accumulators defined in the stylesheet are implicitly available.
- Referencing `accumulator-before()` or `accumulator-after()` for an accumulator not listed in `use-accumulators` is a static error when streaming is enabled.
- The attribute value is a whitespace-separated list of QNames, not an XPath expression. If an accumulator is in a namespace, the QName must use a prefix bound in the stylesheet.
- Activating unused accumulators in a streaming template wastes memory; list only those actually queried in the template.

## See also

- [xsl:accumulator](../xsl-accumulator)
- [xsl:accumulator-rule](../xsl-accumulator-rule)
- [accumulator-before()](../xpath-accumulator-before)
- [accumulator-after()](../xpath-accumulator-after)
