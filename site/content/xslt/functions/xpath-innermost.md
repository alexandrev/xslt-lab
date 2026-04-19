---
title: "innermost()"
description: "Returns the nodes from the input that are not ancestors of any other node in the input sequence."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "node function"
syntax: "innermost(nodes)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`innermost()` filters a sequence of nodes to keep only those that are not ancestors of any other node in the same sequence. In other words, it removes from the sequence any node that has a descendant also present in the sequence, retaining only the deepest nodes.

The result is returned in document order. `innermost()` is the complement of `outermost()`: where `outermost()` keeps the highest ancestors, `innermost()` keeps the lowest descendants. Together they let you work with the boundaries of an overlapping selection.

This function is especially useful when combining results from multiple XPath expressions that may select nodes at different levels of the same subtree.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodes` | node()* | Yes | The sequence of nodes to filter. |

## Return value

`node()*` — the subset of input nodes that have no descendants in the input sequence, in document order.

## Examples

### Filtering to leaf-level selections

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<doc>
  <section id="s1">
    <para id="p1">First</para>
    <para id="p2">Second</para>
  </section>
</doc>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/doc">
    <!-- Both section and para are in the union -->
    <xsl:variable name="all" select="section | section/para"/>
    <innermost-result>
      <xsl:for-each select="innermost($all)">
        <node id="{@id}"/>
      </xsl:for-each>
    </innermost-result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<innermost-result>
  <node id="p1"/>
  <node id="p2"/>
</innermost-result>
```

### Comparing innermost and outermost

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/doc">
    <xsl:variable name="all" select="section | section/para"/>
    <comparison>
      <innermost count="{count(innermost($all))}"/>
      <outermost count="{count(outermost($all))}"/>
    </comparison>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<comparison>
  <innermost count="2"/>
  <outermost count="1"/>
</comparison>
```

## Notes

- If no node in the sequence is an ancestor of any other, `innermost()` returns the full sequence in document order.
- If the sequence contains a single node, `innermost()` returns that same node.
- `innermost()` eliminates redundancy when merging selections that may overlap at different levels of nesting.
- The result is always in document order regardless of the input order.

## See also

- [outermost()](../xpath-outermost)
- [has-children()](../xpath-has-children)
- [path()](../xpath-path)
