---
title: "map:get()"
description: "Returns the value associated with a key in a map, or the empty sequence if the key is not present."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "map function"
syntax: "map:get(map, key)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`map:get()` retrieves the value associated with a given key in a map. If the key does not exist, the empty sequence is returned — not an error. Because the empty sequence can also be a legitimate value, use `map:contains()` to distinguish "key absent" from "key maps to empty sequence".

An alternative shorthand is `$map($key)` using function-call syntax on a map.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `map` | map(*) | Yes | The map to look up. |
| `key` | xs:anyAtomicType | Yes | The key whose value is to be retrieved. |

## Return value

`item()*` — the value associated with the key, or the empty sequence if absent.

## Examples

### Basic map lookup

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="capitals" select="map{
      'France': 'Paris',
      'Germany': 'Berlin',
      'Japan': 'Tokyo'
    }"/>
    <capitals>
      <xsl:for-each select="('France', 'Japan', 'Italy')">
        <country name="{.}">
          <xsl:value-of select="(map:get($capitals, .), 'Unknown')[1]"/>
        </country>
      </xsl:for-each>
    </capitals>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<capitals>
  <country name="France">Paris</country>
  <country name="Japan">Tokyo</country>
  <country name="Italy">Unknown</country>
</capitals>
```

### Using function-call shorthand $map($key)

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="prices" select="map{
      'apple': 0.99,
      'banana': 0.59,
      'cherry': 2.49
    }"/>
    <!-- Both syntaxes are equivalent -->
    <prices>
      <item>apple: <xsl:value-of select="$prices('apple')"/></item>
      <item>banana: <xsl:value-of select="map:get($prices, 'banana')"/></item>
    </prices>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<prices>
  <item>apple: 0.99</item>
  <item>banana: 0.59</item>
</prices>
```

## Notes

- `map:get()` and `$map($key)` are equivalent; the shorthand is more concise for inline expressions.
- Returns the empty sequence (not an error) for missing keys; use `map:contains()` when you need to distinguish absence from an empty-sequence value.
- Key comparison is type-aware: `xs:integer(1)` and `xs:string('1')` are different keys.

## See also

- [map:contains()](../xpath-map-contains)
- [map:put()](../xpath-map-put)
- [map:keys()](../xpath-map-keys)
- [map:entry()](../xpath-map-entry)
- [xsl:map](../xsl-map)
- [xsl:map-entry](../xsl-map-entry)
