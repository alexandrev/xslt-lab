---
title: "xsl:key"
description: "Defines a named index for efficiently selecting nodes using the key() function in XSLT 1.0 and later."
date: 2026-04-19T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: "<xsl:key name=\"name\" match=\"pattern\" use=\"expression\"/>"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6a2V5IG5hbWU9ImJ5LWNhdGVnb3J5IiBtYXRjaD0icHJvZHVjdCIgdXNlPSJAY2F0ZWdvcnkiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iL2NhdGFsb2ciPgogICAgPGVsZWN0cm9uaWNzPgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0ia2V5KCdieS1jYXRlZ29yeScsICdlbGVjdHJvbmljcycpIj4KICAgICAgICA8aXRlbT48eHNsOnZhbHVlLW9mIHNlbGVjdD0iLiIvPjwvaXRlbT4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L2VsZWN0cm9uaWNzPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNhdGFsb2c-CiAgPHByb2R1Y3QgaWQ9InAxIiBjYXRlZ29yeT0iZWxlY3Ryb25pY3MiPkxhcHRvcDwvcHJvZHVjdD4KICA8cHJvZHVjdCBpZD0icDIiIGNhdGVnb3J5PSJib29rcyI-WFBhdGggR3VpZGU8L3Byb2R1Y3Q-CiAgPHByb2R1Y3QgaWQ9InAzIiBjYXRlZ29yeT0iZWxlY3Ryb25pY3MiPlRhYmxldDwvcHJvZHVjdD4KICA8cHJvZHVjdCBpZD0icDQiIGNhdGVnb3J5PSJib29rcyI-WFNMVCBDb29rYm9vazwvcHJvZHVjdD4KPC9jYXRhbG9nPg&version=1.0"
---

## Description

`xsl:key` declares a named index that associates nodes matched by the `match` pattern with key values computed by the `use` expression. Once declared, the `key()` function retrieves nodes from this index in constant time regardless of document size, making it the preferred technique for cross-referencing nodes.

Keys are declared as top-level elements of the stylesheet. Multiple `xsl:key` declarations with the same name accumulate: a node is indexed under a key value if any of the declarations with that name assigns that value to it. This makes it straightforward to build multi-column indexes.

The `use` expression is evaluated with the matched node as the context node. If `use` returns a node-set, each node in the set contributes a separate key value. String values are compared after whitespace normalization using the default collation.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | QName | Yes | The name used to reference this key in the `key()` function. |
| `match` | pattern | Yes | An XSLT pattern identifying which nodes are indexed by this key. |
| `use` | expression | Yes | An XPath expression evaluated for each matched node to determine its key value(s). |

## Return value

`xsl:key` is a declaration — it produces no output. It instructs the processor to build an index that is queried via the `key()` function.

## Examples

### Looking up products by category

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <product id="p1" category="electronics">Laptop</product>
  <product id="p2" category="books">XPath Guide</product>
  <product id="p3" category="electronics">Tablet</product>
  <product id="p4" category="books">XSLT Cookbook</product>
</catalog>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:key name="by-category" match="product" use="@category"/>

  <xsl:template match="/catalog">
    <electronics>
      <xsl:for-each select="key('by-category', 'electronics')">
        <item><xsl:value-of select="."/></item>
      </xsl:for-each>
    </electronics>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<electronics>
  <item>Laptop</item>
  <item>Tablet</item>
</electronics>
```

### Muenchian grouping by first letter

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<names>
  <name>Alice</name>
  <name>Bob</name>
  <name>Anna</name>
  <name>Brian</name>
</names>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:key name="by-letter" match="name" use="substring(., 1, 1)"/>

  <xsl:template match="/names">
    <groups>
      <xsl:for-each select="name[generate-id() = generate-id(key('by-letter', substring(., 1, 1))[1])]">
        <group letter="{substring(., 1, 1)}">
          <xsl:for-each select="key('by-letter', substring(., 1, 1))">
            <name><xsl:value-of select="."/></name>
          </xsl:for-each>
        </group>
      </xsl:for-each>
    </groups>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<groups>
  <group letter="A">
    <name>Alice</name>
    <name>Anna</name>
  </group>
  <group letter="B">
    <name>Bob</name>
    <name>Brian</name>
  </group>
</groups>
```

## Notes

- `xsl:key` must appear as a top-level child of `xsl:stylesheet` or `xsl:transform`.
- The Muenchian grouping technique relies on `xsl:key` combined with `generate-id()` and is the standard XSLT 1.0 method for grouping nodes.
- In XSLT 2.0 and later, `xsl:for-each-group` supersedes Muenchian grouping for most use cases, but `xsl:key` remains useful for random-access lookups.
- Keys built from large documents are cached by the processor and reused across multiple `key()` calls.

## See also

- [key()](../xpath-key)
- [xsl:for-each](../xsl-for-each)
- [generate-id()](../xpath-generate-id)
