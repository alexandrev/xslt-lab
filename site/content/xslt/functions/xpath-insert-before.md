---
title: "insert-before()"
description: "Returns a new sequence with one or more items inserted at a specified 1-based position, without modifying the original sequence."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "insert-before(sequence, position, insert)"
tags: ["xslt", "reference", "xslt2", "xpath"]
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
