---
title: "fold-left()"
description: "Accumulates a result by applying a function left-to-right over a sequence, starting from an initial zero value."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "higher-order function"
syntax: "fold-left(sequence, zero, function)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgoKICA8eHNsOm91dHB1dCBtZXRob2Q9InhtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iLyI-CiAgICA8cmVzdWx0PgogICAgICA8eHNsOnZhcmlhYmxlIG5hbWU9Im51bXMiIHNlbGVjdD0iKDEsIDIsIDMsIDQsIDUpIi8-CiAgICAgIDxzdW0-CiAgICAgICAgPHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImZvbGQtbGVmdCgkbnVtcywgMCwgZnVuY3Rpb24oJGFjYywgJHgpIHsgJGFjYyArICR4IH0pIi8-CiAgICAgIDwvc3VtPgogICAgICA8cHJvZHVjdD4KICAgICAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0iZm9sZC1sZWZ0KCRudW1zLCAxLCBmdW5jdGlvbigkYWNjLCAkeCkgeyAkYWNjICogJHggfSkiLz4KICAgICAgPC9wcm9kdWN0PgogICAgPC9yZXN1bHQ-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHRhZ3M-CiAgPHRhZz54c2x0PC90YWc-CiAgPHRhZz54cGF0aDwvdGFnPgogIDx0YWc-eG1sPC90YWc-CjwvdGFncz4&version=3.0"
---

## Description

`fold-left()` (also called a left reduce) processes a sequence from left to right. It begins with an initial accumulator value (`zero`) and repeatedly applies a binary function that takes the current accumulator and the next item, producing the new accumulator. The final accumulator value is the result.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The sequence to fold over. |
| `zero` | item()* | Yes | The initial accumulator value. |
| `function` | function(item()*, item()) as item()* | Yes | A binary function: (accumulator, currentItem) → newAccumulator. |

## Return value

`item()*` — the final accumulated value after processing all items.

## Examples

### Summing a sequence of numbers

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <result>
      <xsl:variable name="nums" select="(1, 2, 3, 4, 5)"/>
      <sum>
        <xsl:value-of select="fold-left($nums, 0, function($acc, $x) { $acc + $x })"/>
      </sum>
      <product>
        <xsl:value-of select="fold-left($nums, 1, function($acc, $x) { $acc * $x })"/>
      </product>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <sum>15</sum>
  <product>120</product>
</result>
```

### Building a string from a sequence

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<tags>
  <tag>xslt</tag>
  <tag>xpath</tag>
  <tag>xml</tag>
</tags>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/tags">
    <result>
      <xsl:value-of select="fold-left(
        tag[position() gt 1],
        string(tag[1]),
        function($acc, $t) { $acc || ', ' || string($t) }
      )"/>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>xslt, xpath, xml</result>
```

## Notes

- `fold-left()` processes items in sequence order (left to right). For right-to-left, use `fold-right()`.
- If the sequence is empty, the `zero` value is returned unchanged.
- The accumulator can be any XDM value, including maps, arrays, or sequences.
- For array-based folding, use `array:fold-left()`.

## See also

- [fold-right()](../xpath-fold-right)
- [for-each()](../xpath-for-each)
- [filter()](../xpath-filter)
- [for-each-pair()](../xpath-for-each-pair)
- [array:fold-left()](../xpath-array-fold-left)
