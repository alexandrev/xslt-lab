---
title: "xsl:accumulator-rule"
description: "Defines when and how an xsl:accumulator's value is updated, matching nodes by pattern and firing at the start or end of matched elements."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: '<xsl:accumulator-rule match="pattern" phase="start|end" select="expression"/>'
tags: ["xslt", "reference", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOmFjY3VtdWxhdG9yIG5hbWU9ImRlcHRoIiBhcz0ieHM6aW50ZWdlciIgaW5pdGlhbC12YWx1ZT0iMCI-CiAgICA8eHNsOmFjY3VtdWxhdG9yLXJ1bGUgbWF0Y2g9Im5vZGUiIHBoYXNlPSJzdGFydCIgc2VsZWN0PSIkdmFsdWUgKyAxIi8-CiAgICA8eHNsOmFjY3VtdWxhdG9yLXJ1bGUgbWF0Y2g9Im5vZGUiIHBoYXNlPSJlbmQiIHNlbGVjdD0iJHZhbHVlIC0gMSIvPgogIDwveHNsOmFjY3VtdWxhdG9yPgoKICA8eHNsOm1vZGUgdXNlLWFjY3VtdWxhdG9ycz0iZGVwdGgiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iL3RyZWUiPgogICAgPGZsYXQtbGlzdD4KICAgICAgPHhzbDphcHBseS10ZW1wbGF0ZXMgc2VsZWN0PSIvL25vZGUiLz4KICAgIDwvZmxhdC1saXN0PgogIDwveHNsOnRlbXBsYXRlPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSJub2RlIj4KICAgIDxpdGVtIGlkPSJ7QGlkfSIgZGVwdGg9InthY2N1bXVsYXRvci1iZWZvcmUoJ2RlcHRoJyl9Ii8-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHRyZWU-CiAgPG5vZGUgaWQ9IjEiPgogICAgPG5vZGUgaWQ9IjEuMSI-CiAgICAgIDxub2RlIGlkPSIxLjEuMSIvPgogICAgPC9ub2RlPgogICAgPG5vZGUgaWQ9IjEuMiIvPgogIDwvbm9kZT4KPC90cmVlPg&version=3.0"
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
