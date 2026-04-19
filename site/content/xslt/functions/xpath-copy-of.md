---
title: "copy-of()"
description: "Returns a deep copy of all nodes in the sequence, detached from the original document."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "copy-of(sequence)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9saWJyYXJ5Ij4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0ic25hcHNob3QiIHNlbGVjdD0iY29weS1vZihib29rKSIvPgogICAgPGNvcGllcz4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9IiRzbmFwc2hvdCI-CiAgICAgICAgPHhzbDpjb3B5LW9mIHNlbGVjdD0iLiIvPgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwvY29waWVzPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGxpYnJhcnk-CiAgPGJvb2s-PHRpdGxlPlhTTFQgMi4wPC90aXRsZT48YXV0aG9yPktheTwvYXV0aG9yPjwvYm9vaz4KICA8Ym9vaz48dGl0bGU-WFBhdGg8L3RpdGxlPjxhdXRob3I-TWFuZ2FubzwvYXV0aG9yPjwvYm9vaz4KPC9saWJyYXJ5Pg&version=2.0"
---

## Description

`copy-of()` returns a deep copy of each node in the sequence. The copies are new nodes that are not part of any existing document tree — they are detached roots. Modifications to the original nodes do not affect the copies, and the copies share no identity with their originals.

This function is the XPath 2.0 function counterpart to the `xsl:copy-of` instruction. It is especially useful inside XPath expressions where you need to pass a fresh copy of a subtree to a function, store it in a variable, or use it as a constructor argument.

Atomic values in the sequence are returned as-is; only node items are copied.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The nodes (and atomic values) to copy. |

## Return value

`item()*` — deep copies of any node items in the sequence; atomic values returned unchanged.

## Examples

### Storing a copy in a variable

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<library>
  <book><title>XSLT 2.0</title><author>Kay</author></book>
  <book><title>XPath</title><author>Mangano</author></book>
</library>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/library">
    <xsl:variable name="snapshot" select="copy-of(book)"/>
    <copies>
      <xsl:for-each select="$snapshot">
        <xsl:copy-of select="."/>
      </xsl:for-each>
    </copies>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<copies>
  <book><title>XSLT 2.0</title><author>Kay</author></book>
  <book><title>XPath</title><author>Mangano</author></book>
</copies>
```

### Passing a copy to a function

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:f="urn:functions">
  <xsl:output method="xml" indent="yes"/>

  <xsl:function name="f:wrap">
    <xsl:param name="nodes" as="node()*"/>
    <wrapper>
      <xsl:copy-of select="$nodes"/>
    </wrapper>
  </xsl:function>

  <xsl:template match="/library">
    <xsl:copy-of select="f:wrap(copy-of(book[1]))"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<wrapper>
  <book><title>XSLT 2.0</title><author>Kay</author></book>
</wrapper>
```

## Notes

- `copy-of()` creates parentless copies; the copies have no document-node parent and no sibling nodes.
- The function copies all descendants, attributes, namespace nodes, and text content recursively.
- It differs from `xsl:copy-of` (the instruction) in that it can be used inline in an XPath expression rather than as a standalone instruction.
- In XSLT 3.0, `snapshot()` serves a similar purpose for streaming contexts where nodes may not be available after the streaming pass ends.

## See also

- [snapshot()](../xpath-snapshot)
- [deep-equal()](../xpath-deep-equal)
- [xsl:copy-of](../xsl-copy-of)
