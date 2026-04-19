---
title: "outermost()"
description: "Returns the nodes from the input that are not descendants of any other node in the input sequence."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "node function"
syntax: "outermost(nodes)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9yZXBvcnQiPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJtaXhlZCIgc2VsZWN0PSJjaGFwdGVyIHwgY2hhcHRlci9zZWN0aW9uIHwgY2hhcHRlci9zZWN0aW9uL3BhcmEiLz4KICAgIDxvdXRlcm1vc3Qtbm9kZXM-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJvdXRlcm1vc3QoJG1peGVkKSI-CiAgICAgICAgPG5vZGUgaWQ9IntAaWR9IiBuYW1lPSJ7bmFtZSgpfSIvPgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwvb3V0ZXJtb3N0LW5vZGVzPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJlcG9ydD4KICA8Y2hhcHRlciBpZD0iY2gxIj4KICAgIDxzZWN0aW9uIGlkPSJzMSI-PHBhcmE-VGV4dDwvcGFyYT48L3NlY3Rpb24-CiAgPC9jaGFwdGVyPgogIDxjaGFwdGVyIGlkPSJjaDIiLz4KPC9yZXBvcnQ-&version=3.0"
---

## Description

`outermost()` filters a sequence of nodes to keep only those that are not descendants of any other node in the same sequence. It removes any node that has an ancestor also in the sequence, keeping only the highest-level nodes.

The result is returned in document order. `outermost()` is the complement of `innermost()`: where `innermost()` retains the deepest nodes, `outermost()` retains the shallowest ancestors. The function is useful for deduplicating overlapping selections and for determining the roots of a set of subtrees.

A common use case is normalizing the result of multiple union expressions where some selected nodes are contained within others — `outermost()` strips the redundant descendants, leaving only the minimal covering set.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodes` | node()* | Yes | The sequence of nodes to filter. |

## Return value

`node()*` — the subset of input nodes that have no ancestors in the input sequence, in document order.

## Examples

### Finding the top-level selected nodes

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report>
  <chapter id="ch1">
    <section id="s1"><para>Text</para></section>
  </chapter>
  <chapter id="ch2"/>
</report>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/report">
    <xsl:variable name="mixed" select="chapter | chapter/section | chapter/section/para"/>
    <outermost-nodes>
      <xsl:for-each select="outermost($mixed)">
        <node id="{@id}" name="{name()}"/>
      </xsl:for-each>
    </outermost-nodes>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<outermost-nodes>
  <node id="ch1" name="chapter"/>
  <node id="ch2" name="chapter"/>
</outermost-nodes>
```

### Deduplicating subtree roots

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/report">
    <xsl:variable name="all" select="chapter | chapter/section"/>
    <xsl:value-of select="count(outermost($all))"/>
    <xsl:text> outermost nodes</xsl:text>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
2 outermost nodes
```

## Notes

- If no node in the sequence is a descendant of any other, `outermost()` returns all nodes in document order.
- `outermost()` is particularly useful when preparing a node-set for `xsl:copy-of` where copying an ancestor would duplicate its descendants.
- The result is always in document order regardless of the input order.
- The function was introduced in XPath 3.0 / XSLT 3.0 alongside the general expansion of sequence manipulation functions.

## See also

- [innermost()](../xpath-innermost)
- [has-children()](../xpath-has-children)
- [path()](../xpath-path)
