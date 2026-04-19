---
title: "xsl:copy-of"
description: "Performs a deep copy of a node-set or value into the result tree, preserving all descendants, attributes, and namespaces."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:copy-of select="expression"/>'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:copy-of` evaluates the `select` expression and copies the entire result into the output tree. Unlike `xsl:copy`, which copies only the current node shallowly, `xsl:copy-of` performs a **deep copy**: element nodes are copied with all their attributes, namespace nodes, and all descendant nodes recursively.

If the `select` expression yields a node-set, each node in the set is deep-copied in document order. If the expression yields a string, number, or boolean, it is converted to its string representation and output as a text node — which is the same behaviour as `xsl:value-of`.

A particularly important use in XSLT 1.0 is copying result tree fragments stored in variables. A content-based `xsl:variable` produces an RTF, and `xsl:copy-of` is one of the few operations that can emit an RTF into the result tree directly without first converting it to a string.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | XPath expression | Yes | Node-set, value, or variable reference to copy into the output. |

## Examples

### Deep copy of a subtree

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <product id="p1">
    <name>Widget</name>
    <specs>
      <weight unit="kg">0.5</weight>
      <color>blue</color>
    </specs>
  </product>
  <product id="p2">
    <name>Gadget</name>
    <specs>
      <weight unit="kg">1.2</weight>
      <color>red</color>
    </specs>
  </product>
</catalog>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
    <selected>
      <xsl:copy-of select="product[@id='p1']"/>
    </selected>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<selected>
  <product id="p1">
    <name>Widget</name>
    <specs>
      <weight unit="kg">0.5</weight>
      <color>blue</color>
    </specs>
  </product>
</selected>
```

### Copying a result tree fragment from a variable

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data><value>42</value></data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <xsl:variable name="box">
      <wrapper>
        <content><xsl:value-of select="value"/></content>
      </wrapper>
    </xsl:variable>
    <root>
      <xsl:copy-of select="$box"/>
      <xsl:copy-of select="$box"/>
    </root>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<root>
  <wrapper><content>42</content></wrapper>
  <wrapper><content>42</content></wrapper>
</root>
```

## Notes

- `xsl:copy-of` preserves namespace nodes of copied elements. If namespaces from the source document are not desired in the output, you will need to rebuild the elements manually or use `exclude-result-prefixes` on the stylesheet element.
- Unlike `xsl:value-of`, `xsl:copy-of` does not serialize the node to text — it inserts actual node copies, preserving XML structure.
- When the select expression is a string or number, `xsl:copy-of` and `xsl:value-of` produce identical results. The meaningful difference arises with node-sets and RTFs.
- In XSLT 2.0+, `xsl:copy-of` accepts a `copy-namespaces` attribute (`yes` / `no`) to control whether namespace nodes are included in element copies.

## See also

- [xsl:copy](../xsl-copy)
- [xsl:variable](../xsl-variable)
