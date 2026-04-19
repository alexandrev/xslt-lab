---
title: "current-merge-group()"
description: "Returns the sequence of items in the current merge group inside an xsl:merge-action block."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "node function"
syntax: "current-merge-group(source?)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`current-merge-group()` is used inside the `xsl:merge-action` child of an `xsl:merge` instruction. It returns the sequence of items from the current merge group — that is, all items from one or more merge sources that share the same current merge key.

When `xsl:merge` processes multiple input streams simultaneously, it groups corresponding items by their computed merge key. Inside `xsl:merge-action`, `current-merge-group()` without an argument returns all items from all sources in the current group. When a `source` argument is supplied (the value of a `for-each-source` attribute or a source name), the function returns items only from that specific merge source.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source` | xs:string | No | The name of the merge source to restrict the group to. Omit to get items from all sources. |

## Return value

`item()*` — the items in the current merge group, optionally restricted to a named source.

## Examples

### Merging two sorted lists

**Input XML (file1.xml):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<items>
  <item key="a">Alpha from source1</item>
  <item key="b">Beta from source1</item>
</items>
```

**Input XML (file2.xml):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<items>
  <item key="a">Alpha from source2</item>
  <item key="c">Gamma from source2</item>
</items>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <merged>
      <xsl:merge>
        <xsl:merge-source name="s1" select="doc('file1.xml')/items/item">
          <xsl:merge-key select="@key"/>
        </xsl:merge-source>
        <xsl:merge-source name="s2" select="doc('file2.xml')/items/item">
          <xsl:merge-key select="@key"/>
        </xsl:merge-source>
        <xsl:merge-action>
          <group key="{current-merge-key()}">
            <xsl:for-each select="current-merge-group()">
              <item><xsl:value-of select="."/></item>
            </xsl:for-each>
          </group>
        </xsl:merge-action>
      </xsl:merge>
    </merged>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<merged>
  <group key="a">
    <item>Alpha from source1</item>
    <item>Alpha from source2</item>
  </group>
  <group key="b">
    <item>Beta from source1</item>
  </group>
  <group key="c">
    <item>Gamma from source2</item>
  </group>
</merged>
```

### Reading from a specific source

**Stylesheet snippet:**
```xml
<xsl:merge-action>
  <!-- Only items from source s1 -->
  <xsl:for-each select="current-merge-group('s1')">
    <s1-item><xsl:value-of select="."/></s1-item>
  </xsl:for-each>
</xsl:merge-action>
```

## Notes

- `current-merge-group()` is only valid inside the `xsl:merge-action` element; using it elsewhere raises a static error.
- Without an argument, it returns items from all named merge sources combined.
- The merge sources must provide pre-sorted input or declare sort keys via `xsl:merge-key` for `xsl:merge` to operate correctly.
- `current-merge-group()` and `current-merge-key()` are the two functions designed specifically for use inside `xsl:merge-action`.

## See also

- [current-merge-key()](../xpath-current-merge-key)
- [xsl:use-accumulators](../xsl-use-accumulators)
