---
title: "xsl:array"
description: "Creates an XDM array from xsl:array-member children, providing ordered positional access to sequences of arbitrary XDM values in XSLT 3.0."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:array><xsl:array-member .../></xsl:array>"
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:array` is the instruction for constructing an XDM array. Arrays are ordered, positionally indexed collections introduced in XDM 3.1. They differ from sequences in a critical way: each member of an array can itself be a sequence of zero or more items, whereas sequences are always flat. This makes arrays essential for representing JSON arrays (which can contain nested arrays and objects) and for passing multi-valued parameters to functions.

The instruction form `xsl:array` is used when the members must be computed dynamically. You populate it with `xsl:array-member` children, optionally interspersed with `xsl:for-each`, `xsl:if`, and other XSLT instructions. For simple cases where members are known at compile time, the XPath square-bracket syntax `[item1, item2]` is more concise.

An XDM array is a function from an integer position (1-based) to its member value. You access members with `array:get($arr, $pos)` or the shorthand `$arr($pos)`.

## Attributes

`xsl:array` has no element-specific attributes. Its content must consist of `xsl:array-member` instructions (and other instructions producing array members).

## Examples

### Creating an array from XML nodes

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<playlist>
  <track>Shape of You</track>
  <track>Blinding Lights</track>
  <track>Levitating</track>
</playlist>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">
  <xsl:output method="json" indent="yes"/>

  <xsl:template match="/playlist">
    <xsl:map>
      <xsl:map-entry key="'title'" select="'My Playlist'"/>
      <xsl:map-entry key="'tracks'">
        <xsl:array>
          <xsl:for-each select="track">
            <xsl:array-member select="string(.)"/>
          </xsl:for-each>
        </xsl:array>
      </xsl:map-entry>
    </xsl:map>
  </xsl:template>
</xsl:stylesheet>
```

**Output (JSON):**
```json
{
  "title": "My Playlist",
  "tracks": ["Shape of You", "Blinding Lights", "Levitating"]
}
```

### Array of sequences (each member holds multiple values)

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <xsl:variable name="matrix">
      <xsl:array>
        <xsl:array-member select="(1, 2, 3)"/>
        <xsl:array-member select="(4, 5, 6)"/>
        <xsl:array-member select="(7, 8, 9)"/>
      </xsl:array>
    </xsl:variable>
    <result>
      <!-- Access row 2, then second element of that sequence -->
      <cell><xsl:value-of select="array:get($matrix, 2)[2]"/></cell>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <cell>5</cell>
</result>
```

## Notes

- Arrays are 1-indexed. `array:get($arr, 1)` retrieves the first member.
- Each member of an `xsl:array` is a *sequence*, not just a single item. This is what distinguishes arrays from flat sequences.
- The XPath shorthand `[ ]` creates an array where each member is a single item.
- To append or modify an array, use functions like `array:append()`, `array:put()`, or `array:insert-before()`.
- `xsl:array` can be used inside `xsl:map-entry` to create JSON-compatible nested structures.

## See also

- [xsl:array-member](../xsl-array-member)
- [array:get()](../xpath-array-get)
- [xsl:map](../xsl-map)
