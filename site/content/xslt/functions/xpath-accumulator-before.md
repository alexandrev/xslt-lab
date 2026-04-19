---
title: "accumulator-before()"
description: "Returns the value of a named accumulator computed before processing the current node in streaming mode."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "node function"
syntax: "accumulator-before(name)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOmFjY3VtdWxhdG9yIG5hbWU9InJ1bm5pbmctdG90YWwiIGluaXRpYWwtdmFsdWU9InhzOmRlY2ltYWwoMCkiPgogICAgPHhzbDphY2N1bXVsYXRvci1ydWxlIG1hdGNoPSJzYWxlIiBzZWxlY3Q9IiR2YWx1ZSArIHhzOmRlY2ltYWwoQGFtb3VudCkiLz4KICA8L3hzbDphY2N1bXVsYXRvcj4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iL3NhbGVzIj4KICAgIDxyZXBvcnQ-CiAgICAgIDx4c2w6YXBwbHktdGVtcGxhdGVzIHNlbGVjdD0ic2FsZSIgdXNlLWFjY3VtdWxhdG9ycz0icnVubmluZy10b3RhbCIvPgogICAgPC9yZXBvcnQ-CiAgPC94c2w6dGVtcGxhdGU-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9InNhbGUiIHVzZS1hY2N1bXVsYXRvcnM9InJ1bm5pbmctdG90YWwiPgogICAgPHNhbGUgYW1vdW50PSJ7QGFtb3VudH0iIGJlZm9yZT0ie2FjY3VtdWxhdG9yLWJlZm9yZSgncnVubmluZy10b3RhbCcpfSIvPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHNhbGVzPgogIDxzYWxlIGFtb3VudD0iMTAwIi8-CiAgPHNhbGUgYW1vdW50PSIyNTAiLz4KICA8c2FsZSBhbW91bnQ9Ijc1Ii8-Cjwvc2FsZXM-&version=3.0"
---

## Description

`accumulator-before()` returns the value of a named accumulator as it was just before the current node was processed. Accumulators are XSLT 3.0 constructs that compute running values as the processor traverses a document — similar to a running total or state machine. The "before" value reflects the accumulator state prior to applying any accumulator rule for the current node.

The function is used inside `xsl:accumulator-rule` actions and in template rules that access accumulator state. The `name` argument is a string literal matching the `name` attribute of an `xsl:accumulator` declaration.

For the function to be available in a template, the template must declare the accumulator in its `use-accumulators` attribute (or via `xsl:use-accumulators`).

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | xs:string | Yes | The name of the accumulator to read. |

## Return value

The declared return type of the named accumulator — the value computed just before the current node is entered.

## Examples

### Running total accumulator

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sales>
  <sale amount="100"/>
  <sale amount="250"/>
  <sale amount="75"/>
</sales>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:accumulator name="running-total" initial-value="xs:decimal(0)">
    <xsl:accumulator-rule match="sale" select="$value + xs:decimal(@amount)"/>
  </xsl:accumulator>

  <xsl:template match="/sales">
    <report>
      <xsl:apply-templates select="sale" use-accumulators="running-total"/>
    </report>
  </xsl:template>

  <xsl:template match="sale" use-accumulators="running-total">
    <sale amount="{@amount}" before="{accumulator-before('running-total')}"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<report>
  <sale amount="100" before="0"/>
  <sale amount="250" before="100"/>
  <sale amount="75" before="350"/>
</report>
```

### Comparing before and after values

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:accumulator name="count" initial-value="xs:integer(0)">
    <xsl:accumulator-rule match="sale" select="$value + 1"/>
  </xsl:accumulator>

  <xsl:template match="/sales">
    <xsl:apply-templates select="sale" use-accumulators="count"/>
  </xsl:template>

  <xsl:template match="sale" use-accumulators="count">
    <item seq-before="{accumulator-before('count')}" seq-after="{accumulator-after('count')}"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<item seq-before="0" seq-after="1"/>
<item seq-before="1" seq-after="2"/>
<item seq-before="2" seq-after="3"/>
```

## Notes

- `accumulator-before()` reads the accumulator value before the node's rule fires; `accumulator-after()` reads it after.
- The accumulator must be declared with `xsl:accumulator` at the top level and listed in the template's `use-accumulators` attribute.
- Accumulators are primarily designed for streaming, but they also work in non-streaming transformations.
- The initial value is used as the "before" value for the first matched node.

## See also

- [accumulator-after()](../xpath-accumulator-after)
- [snapshot()](../xpath-snapshot)
- [xsl:use-accumulators](../xsl-use-accumulators)
