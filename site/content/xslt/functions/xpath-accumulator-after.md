---
title: "accumulator-after()"
description: "Returns the value of a named accumulator computed after processing the current node in streaming mode."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "node function"
syntax: "accumulator-after(name)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`accumulator-after()` returns the value of a named accumulator as computed just after all accumulator rules for the current node have been applied. It is the counterpart to `accumulator-before()`: where `accumulator-before()` gives the value before the node's rule fires, `accumulator-after()` gives the updated value reflecting the current node's contribution.

The function is only meaningful in contexts where an accumulator rule for the named accumulator has a match for the current node. If no rule matches, before and after values are identical.

Both accumulator functions are essential for streaming transformations where you cannot revisit nodes. They allow you to carry state forward through the document without storing nodes in memory.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | xs:string | Yes | The name of the accumulator to read. |

## Return value

The declared return type of the named accumulator — the value computed after the current node's accumulator rule has been applied.

## Examples

### Cumulative total after each node

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<transactions>
  <tx amount="50"/>
  <tx amount="120"/>
  <tx amount="30"/>
</transactions>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:accumulator name="total" initial-value="xs:decimal(0)">
    <xsl:accumulator-rule match="tx" select="$value + xs:decimal(@amount)"/>
  </xsl:accumulator>

  <xsl:template match="/transactions">
    <ledger>
      <xsl:apply-templates select="tx" use-accumulators="total"/>
    </ledger>
  </xsl:template>

  <xsl:template match="tx" use-accumulators="total">
    <entry amount="{@amount}" running-total="{accumulator-after('total')}"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<ledger>
  <entry amount="50" running-total="50"/>
  <entry amount="120" running-total="170"/>
  <entry amount="30" running-total="200"/>
</ledger>
```

### Final accumulator value on the parent

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:accumulator name="total" initial-value="xs:decimal(0)">
    <xsl:accumulator-rule match="tx" select="$value + xs:decimal(@amount)"/>
  </xsl:accumulator>

  <xsl:template match="/transactions" use-accumulators="total">
    <xsl:apply-templates select="tx"/>
    <grand-total><xsl:value-of select="accumulator-after('total')"/></grand-total>
  </xsl:template>

  <xsl:template match="tx"/>
</xsl:stylesheet>
```

**Output:**
```xml
<grand-total>200</grand-total>
```

## Notes

- `accumulator-after()` on a node with no matching accumulator rule returns the same value as `accumulator-before()`.
- Accumulators must be listed in the `use-accumulators` attribute of the template or `xsl:use-accumulators` instruction to be active for that template.
- Accumulators are phase-ordered: all accumulator rules are applied before any template generates output for a given node.
- In XSLT 3.0 packages, accumulators can be imported and their visibility controlled with `xsl:expose`.

## See also

- [accumulator-before()](../xpath-accumulator-before)
- [snapshot()](../xpath-snapshot)
- [xsl:use-accumulators](../xsl-use-accumulators)
