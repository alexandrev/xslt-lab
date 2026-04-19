---
title: "insert-before()"
description: "Returns a new sequence with one or more items inserted at a specified 1-based position, without modifying the original sequence."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "insert-before(sequence, position, insert)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0iY29sb3JzIiBzZWxlY3Q9IigncmVkJywgJ2dyZWVuJywgJ2JsdWUnKSIvPgogICAgPCEtLSBJbnNlcnQgJ3llbGxvdycgYmVmb3JlIHBvc2l0aW9uIDIgLS0-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9ImV4dGVuZGVkIgogICAgICBzZWxlY3Q9Imluc2VydC1iZWZvcmUoJGNvbG9ycywgMiwgJ3llbGxvdycpIi8-CiAgICA8Y29sb3JzPgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0iJGV4dGVuZGVkIj4KICAgICAgICA8Y29sb3I-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Ii4iLz48L2NvbG9yPgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwvY29sb3JzPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN0ZXBzPgogIDxzdGVwPkluaXQ8L3N0ZXA-CiAgPHN0ZXA-UHJvY2Vzczwvc3RlcD4KICA8c3RlcD5WYWxpZGF0ZTwvc3RlcD4KICA8c3RlcD5Eb25lPC9zdGVwPgo8L3N0ZXBzPg&version=2.0"
---

## Description

`insert-before()` constructs a new sequence by inserting all items from `insert` immediately before the item at `position` in `sequence`. The original sequence is not modified — XPath sequences are immutable values.

Position is 1-based. Special cases:

- If `position` is less than 1, the inserted items are placed at the beginning.
- If `position` is greater than the length of `sequence`, the inserted items are placed at the end.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The original sequence. |
| `position` | xs:integer | Yes | The 1-based position before which insertion occurs. |
| `insert` | item()* | Yes | The items to insert. May be a single item or a sequence. |

## Return value

`item()*` — a new sequence with the inserted items at the specified position.

## Examples

### Inserting a header item into a sequence

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="colors" select="('red', 'green', 'blue')"/>
    <!-- Insert 'yellow' before position 2 -->
    <xsl:variable name="extended"
      select="insert-before($colors, 2, 'yellow')"/>
    <colors>
      <xsl:for-each select="$extended">
        <color><xsl:value-of select="."/></color>
      </xsl:for-each>
    </colors>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<colors>
  <color>red</color>
  <color>yellow</color>
  <color>green</color>
  <color>blue</color>
</colors>
```

### Building a sequence with a separator between items

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<steps>
  <step>Init</step>
  <step>Process</step>
  <step>Validate</step>
  <step>Done</step>
</steps>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/steps">
    <!-- Insert 'Then:' label before position 2 -->
    <xsl:variable name="step-labels" select="step/string()"/>
    <xsl:variable name="with-label"
      select="insert-before($step-labels, 2, '→')"/>
    <pipeline>
      <xsl:value-of select="$with-label" separator=" "/>
    </pipeline>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<pipeline>Init → Process Validate Done</pipeline>
```

## Notes

- `insert-before()` is a functional operation — the original sequence is unchanged. Assign the result to a new variable.
- `insert-before($seq, 1, $item)` is equivalent to prepending: result is `($item, $seq...)`.
- `insert-before($seq, count($seq)+1, $item)` is equivalent to appending: result is `($seq..., $item)`.
- The `insert` argument may itself be a sequence, allowing multiple items to be inserted at once.

## See also

- [remove()](../xpath-remove)
- [subsequence()](../xpath-subsequence)
- [reverse()](../xpath-reverse)
- [index-of()](../xpath-index-of)
