---
title: "xsl:accumulator"
description: "Declares a streaming accumulator that maintains a typed value updated by rules as nodes are processed, enabling stateful aggregation without multiple passes."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: '<xsl:accumulator name="name" as="type" initial-value="expression" streamable="no">'
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:accumulator` solves one of the hardest problems in streaming XSLT: maintaining state as nodes flow past the processor. In a non-streaming stylesheet you can freely look up ancestors, siblings, and preceding elements. In streaming mode, once a node has been processed it is gone. Accumulators bridge this gap by keeping a running value that is updated automatically as the processor enters and exits matched nodes.

An accumulator is declared as a top-level element with a `name`, an XPath `as` type, and an `initial-value`. One or more `xsl:accumulator-rule` children define the update logic for specific node patterns. Rules fire in document order: a `phase="start"` rule fires when the processor encounters the opening tag; `phase="end"` fires when the closing tag is reached.

To read an accumulator's value at any point, use the XPath functions `accumulator-before('name')` (the value before the current node was processed) or `accumulator-after('name')` (the value after the current node and all its descendants were processed).

Accumulators must be declared in scope for any mode that uses them via `xsl:use-accumulators` on the mode or `use-accumulators` on `xsl:stream`. They are essentially a functional equivalent of mutable global state, but safe for streaming because the processor manages the update lifecycle.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | QName | Yes | The accumulator name, used in `accumulator-before()` and `accumulator-after()`. |
| `as` | sequence type | No | Type of the accumulated value. Default `item()*`. |
| `initial-value` | expression | Yes | Starting value before any node is processed. |
| `streamable` | `yes\|no` | No | Whether the accumulator rules must be streamable. Default `no`. |

## Examples

### Tracking the current section heading while streaming

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
  <section title="Introduction">
    <para>First paragraph.</para>
    <para>Second paragraph.</para>
  </section>
  <section title="Methods">
    <para>Third paragraph.</para>
  </section>
</document>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:accumulator name="current-section" as="xs:string" initial-value="''">
    <xsl:accumulator-rule match="section" phase="start"
      select="string(@title)"/>
    <xsl:accumulator-rule match="section" phase="end"
      select="''"/>
  </xsl:accumulator>

  <xsl:mode use-accumulators="current-section"/>

  <xsl:template match="/document">
    <result>
      <xsl:apply-templates select="section/para"/>
    </result>
  </xsl:template>

  <xsl:template match="para">
    <item section="{accumulator-before('current-section')}">
      <xsl:value-of select="."/>
    </item>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <item section="Introduction">First paragraph.</item>
  <item section="Introduction">Second paragraph.</item>
  <item section="Methods">Third paragraph.</item>
</result>
```

### Running total accumulator

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:accumulator name="running-total" as="xs:decimal"
    initial-value="xs:decimal(0)" streamable="yes">
    <xsl:accumulator-rule match="order" phase="end"
      select="$value + xs:decimal(@amount)"/>
  </xsl:accumulator>

  <xsl:mode streamable="yes" use-accumulators="running-total"/>

  <xsl:template match="/">
    <xsl:stream href="orders.xml">
      <xsl:apply-templates/>
    </xsl:stream>
  </xsl:template>

  <xsl:template match="orders">
    <summary>
      <total><xsl:value-of select="accumulator-after('running-total')"/></total>
    </summary>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- The variable `$value` inside `xsl:accumulator-rule` refers to the *current* accumulator value before the rule fires.
- Accumulators are scoped to the document being processed. When you call `doc()`, the accumulator is re-initialised for that document.
- Multiple accumulators can be active simultaneously on the same mode.
- `streamable="yes"` requires each rule's `select` to be a streamable expression.

## See also

- [xsl:accumulator-rule](../xsl-accumulator-rule)
- [xsl:use-accumulators](../xsl-use-accumulators)
- [accumulator-before()](../xpath-accumulator-before)
- [accumulator-after()](../xpath-accumulator-after)
