---
title: "xsl:accumulator-rule"
description: "Defines when and how an xsl:accumulator's value is updated, matching nodes by pattern and firing at the start or end of matched elements."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: '<xsl:accumulator-rule match="pattern" phase="start|end" select="expression"/>'
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:accumulator-rule` specifies the update logic for an `xsl:accumulator`. Each rule has a `match` pattern (identical in syntax to the `match` attribute of `xsl:template`) and a `phase` that determines whether it fires when the processor enters (`start`) or exits (`end`) a matched element.

When a rule fires, the body expression (either the `select` attribute or the sequence constructor content) is evaluated and its result becomes the new accumulator value. Inside the rule, the special variable `$value` holds the *current* accumulator value before this rule fires. This lets you write incremental updates: `select="$value + xs:decimal(@amount)"` adds the current node's amount to the running total.

Rules within one accumulator are evaluated in document order; if multiple rules could match the same node (due to broad patterns), all matching rules fire in specificity order, similar to template priority. The most specific match wins, just as with `xsl:template`.

The `phase` attribute is optional for non-element nodes: attributes, text nodes, comments, and processing instructions cannot have a start/end phase distinction, so `phase` defaults to `end` for them. For element nodes, `start` fires before any descendants are processed; `end` fires after all descendants have been processed.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `match` | pattern | Yes | Pattern identifying the nodes that trigger this rule. |
| `phase` | `start\|end` | No | When to fire for element nodes: `start` (on entry) or `end` (on exit). Default `end`. |
| `select` | expression | No | The new accumulator value. Mutually exclusive with content. Variable `$value` is in scope. |

## Examples

### Tracking nested depth with start and end rules

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<tree>
  <node id="1">
    <node id="1.1">
      <node id="1.1.1"/>
    </node>
    <node id="1.2"/>
  </node>
</tree>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:accumulator name="depth" as="xs:integer" initial-value="0">
    <xsl:accumulator-rule match="node" phase="start" select="$value + 1"/>
    <xsl:accumulator-rule match="node" phase="end" select="$value - 1"/>
  </xsl:accumulator>

  <xsl:mode use-accumulators="depth"/>

  <xsl:template match="/tree">
    <flat-list>
      <xsl:apply-templates select="//node"/>
    </flat-list>
  </xsl:template>

  <xsl:template match="node">
    <item id="{@id}" depth="{accumulator-before('depth')}"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<flat-list>
  <item id="1" depth="1"/>
  <item id="1.1" depth="2"/>
  <item id="1.1.1" depth="3"/>
  <item id="1.2" depth="2"/>
</flat-list>
```

### Accumulating a list of all ancestor titles

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:accumulator name="breadcrumb" as="xs:string*" initial-value="()">
    <xsl:accumulator-rule match="section" phase="start"
      select="($value, string(@title))"/>
    <xsl:accumulator-rule match="section" phase="end"
      select="$value[position() lt last()]"/>
  </xsl:accumulator>

  <xsl:mode use-accumulators="breadcrumb"/>

  <xsl:template match="para">
    <item>
      <path><xsl:value-of select="accumulator-before('breadcrumb')" separator=" > "/></path>
      <xsl:value-of select="."/>
    </item>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- The `$value` variable is always available inside an `xsl:accumulator-rule` and refers to the current accumulator value before this rule fires.
- For `phase="start"`, `$value` is the accumulator value before the element's opening tag was reached.
- For `phase="end"`, `$value` includes all updates made by descendants of the current element.
- Rules with equal priority for the same node follow the same conflict-resolution logic as `xsl:template`.

## See also

- [xsl:accumulator](../xsl-accumulator)
- [xsl:use-accumulators](../xsl-use-accumulators)
- [accumulator-before()](../xpath-accumulator-before)
- [accumulator-after()](../xpath-accumulator-after)
