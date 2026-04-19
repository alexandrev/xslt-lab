---
title: "has-children()"
description: "Returns true if the node has one or more child nodes; defaults to the context node if no argument is supplied."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "node function"
syntax: "has-children(node?)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii90cmVlIj4KICAgIDxjbGFzc2lmaWVkPgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0iKiI-CiAgICAgICAgPG5vZGUgbmFtZT0ie25hbWUoKX0iIHR5cGU9IntpZiAoaGFzLWNoaWxkcmVuKCkpIHRoZW4gJ2JyYW5jaCcgZWxzZSAnbGVhZid9Ii8-CiAgICAgIDwveHNsOmZvci1lYWNoPgogICAgPC9jbGFzc2lmaWVkPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHRyZWU-CiAgPGJyYW5jaD4KICAgIDxsZWFmPkE8L2xlYWY-CiAgICA8bGVhZj5CPC9sZWFmPgogIDwvYnJhbmNoPgogIDxsZWFmPkM8L2xlYWY-CjwvdHJlZT4&version=3.0"
---

## Description

`has-children()` tests whether a node has at least one child node. A child node may be an element, text node, comment, or processing instruction. Attribute nodes and namespace nodes are not children in the XPath data model, so their presence alone does not cause `has-children()` to return `true`.

When called without arguments, the function tests the context node. When a node is supplied as an argument, that node is tested. If the argument is the empty sequence, `false` is returned.

The function is particularly useful in streaming mode where examining all children of a node is expensive or impossible after the streaming pass. `has-children()` can be evaluated during streaming as a simple flag before the children are consumed.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `node` | node()? | No | The node to test. Defaults to the context node if omitted. |

## Return value

`xs:boolean` — `true` if the node has one or more child nodes, `false` otherwise.

## Examples

### Distinguishing leaf and branch elements

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<tree>
  <branch>
    <leaf>A</leaf>
    <leaf>B</leaf>
  </branch>
  <leaf>C</leaf>
</tree>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/tree">
    <classified>
      <xsl:for-each select="*">
        <node name="{name()}" type="{if (has-children()) then 'branch' else 'leaf'}"/>
      </xsl:for-each>
    </classified>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<classified>
  <node name="branch" type="branch"/>
  <node name="leaf" type="leaf"/>
</classified>
```

### Using has-children() with a supplied node

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/tree">
    <xsl:value-of select="has-children(branch)"/>
    <xsl:text>&#10;</xsl:text>
    <xsl:value-of select="has-children(leaf)"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
true
false
```

## Notes

- `has-children()` is equivalent to `exists(child::node())` but may be more efficient when the processor does not need to materialize the child sequence.
- In streaming mode (`xsl:stream`), `has-children()` is one of the few node tests that can be applied without consuming the children.
- Attribute nodes never have children in the XPath data model, so `has-children(@attr)` always returns `false`.
- Document nodes may also be tested; a document with at least one child element returns `true`.

## See also

- [innermost()](../xpath-innermost)
- [outermost()](../xpath-outermost)
- [path()](../xpath-path)
