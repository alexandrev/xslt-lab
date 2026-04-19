---
title: "xsl:next-iteration"
description: "Advances an xsl:iterate loop to the next item in the sequence, optionally updating loop parameters to carry state forward."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:next-iteration><xsl:with-param .../></xsl:next-iteration>"
tags: ["xslt", "reference", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvc2FsZXMiPgogICAgPHJlcG9ydD4KICAgICAgPHhzbDppdGVyYXRlIHNlbGVjdD0iZGF5Ij4KICAgICAgICA8eHNsOnBhcmFtIG5hbWU9InJ1bm5pbmctdG90YWwiIGFzPSJ4czppbnRlZ2VyIiBzZWxlY3Q9IjAiLz4KICAgICAgICA8eHNsOnBhcmFtIG5hbWU9ImRheS1udW0iIGFzPSJ4czppbnRlZ2VyIiBzZWxlY3Q9IjAiLz4KICAgICAgICA8eHNsOnZhcmlhYmxlIG5hbWU9Im5ldy10b3RhbCIgc2VsZWN0PSIkcnVubmluZy10b3RhbCArIHhzOmludGVnZXIoQGFtb3VudCkiLz4KICAgICAgICA8eHNsOnZhcmlhYmxlIG5hbWU9Im5ldy1kYXkiIHNlbGVjdD0iJGRheS1udW0gKyAxIi8-CiAgICAgICAgPGRheSBuPSJ7JG5ldy1kYXl9IiBhbW91bnQ9IntAYW1vdW50fSIgdG90YWw9InskbmV3LXRvdGFsfSIvPgogICAgICAgIDx4c2w6bmV4dC1pdGVyYXRpb24-CiAgICAgICAgICA8eHNsOndpdGgtcGFyYW0gbmFtZT0icnVubmluZy10b3RhbCIgc2VsZWN0PSIkbmV3LXRvdGFsIi8-CiAgICAgICAgICA8eHNsOndpdGgtcGFyYW0gbmFtZT0iZGF5LW51bSIgc2VsZWN0PSIkbmV3LWRheSIvPgogICAgICAgIDwveHNsOm5leHQtaXRlcmF0aW9uPgogICAgICA8L3hzbDppdGVyYXRlPgogICAgPC9yZXBvcnQ-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHNhbGVzPgogIDxkYXkgYW1vdW50PSIxNTAwIi8-CiAgPGRheSBhbW91bnQ9IjIzMDAiLz4KICA8ZGF5IGFtb3VudD0iOTAwIi8-CiAgPGRheSBhbW91bnQ9IjE4MDAiLz4KICA8ZGF5IGFtb3VudD0iMzEwMCIvPgo8L3NhbGVzPg&version=3.0"
---

## Description

`xsl:next-iteration` is the instruction that passes control to the next iteration of an `xsl:iterate` loop, carrying updated values for one or more loop parameters. It is the XSLT 3.0 equivalent of the tail-recursive call in a recursive named template, but expressed as a readable inline instruction.

Each `xsl:iterate` loop can declare parameters with `xsl:param`. These parameters act as mutable state: their values change with each iteration via `xsl:next-iteration`. Without `xsl:next-iteration`, you cannot update loop parameters — the only other way out of an iteration body is to fall through to the end (which implicitly continues with unchanged parameters) or to execute `xsl:break`.

`xsl:next-iteration` must be a direct child of the `xsl:iterate` body (not nested inside a template called from the iterate). It can appear inside `xsl:if`, `xsl:choose`, or `xsl:when`. Each `xsl:with-param` child names a parameter declared on the `xsl:iterate` and provides its new value. Parameters not mentioned retain their current value.

When `xsl:next-iteration` executes, the current iteration body stops and the loop advances to the next item with the updated parameter values.

## Attributes

`xsl:next-iteration` has no element-specific attributes. It contains `xsl:with-param` children.

## Examples

### Running sum with xsl:iterate

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sales>
  <day amount="1500"/>
  <day amount="2300"/>
  <day amount="900"/>
  <day amount="1800"/>
  <day amount="3100"/>
</sales>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/sales">
    <report>
      <xsl:iterate select="day">
        <xsl:param name="running-total" as="xs:integer" select="0"/>
        <xsl:param name="day-num" as="xs:integer" select="0"/>
        <xsl:variable name="new-total" select="$running-total + xs:integer(@amount)"/>
        <xsl:variable name="new-day" select="$day-num + 1"/>
        <day n="{$new-day}" amount="{@amount}" total="{$new-total}"/>
        <xsl:next-iteration>
          <xsl:with-param name="running-total" select="$new-total"/>
          <xsl:with-param name="day-num" select="$new-day"/>
        </xsl:next-iteration>
      </xsl:iterate>
    </report>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<report>
  <day n="1" amount="1500" total="1500"/>
  <day n="2" amount="2300" total="3800"/>
  <day n="3" amount="900" total="4700"/>
  <day n="4" amount="1800" total="6500"/>
  <day n="5" amount="3100" total="9600"/>
</report>
```

### Tracking maximum value seen so far

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/readings">
    <xsl:variable name="final-max">
      <xsl:iterate select="value">
        <xsl:param name="max" as="xs:integer" select="xs:integer(0)"/>
        <xsl:variable name="current" select="xs:integer(.)"/>
        <xsl:next-iteration>
          <xsl:with-param name="max" select="max(($max, $current))"/>
        </xsl:next-iteration>
        <xsl:on-completion select="$max"/>
      </xsl:iterate>
    </xsl:variable>
    <maximum><xsl:value-of select="$final-max"/></maximum>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `xsl:next-iteration` must appear directly inside the body of `xsl:iterate`, not inside a called template or function.
- If `xsl:next-iteration` is omitted in a branch, the iteration continues with all parameters at their current values.
- `xsl:with-param` children must reference parameters declared on the enclosing `xsl:iterate`.
- `xsl:next-iteration` and `xsl:break` are mutually exclusive exit points for a single execution path through the iteration body.

## See also

- [xsl:break](../xsl-break)
- [xsl:iterate](../xsl-iterate)
