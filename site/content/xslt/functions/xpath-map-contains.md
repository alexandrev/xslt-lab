---
title: "map:contains()"
description: "Returns true if a map contains an entry with the specified key, false otherwise."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "map function"
syntax: "map:contains(map, key)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`map:contains()` tests whether a map has an entry for a given key. The key comparison uses the same rules as map lookup (XDM equality for atomic values). This is preferable to checking `map:get()` for the empty sequence, because a key may legitimately map to the empty sequence.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `map` | map(*) | Yes | The map to test. |
| `key` | xs:anyAtomicType | Yes | The key to look for. |

## Return value

`xs:boolean` — `true` if the map contains the key, `false` otherwise.

## Examples

### Safe conditional lookup

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="settings" select="map{
      'debug': true(),
      'timeout': 30
    }"/>
    <config>
      <has-debug><xsl:value-of select="map:contains($settings, 'debug')"/></has-debug>
      <has-verbose><xsl:value-of select="map:contains($settings, 'verbose')"/></has-verbose>
      <debug-value>
        <xsl:if test="map:contains($settings, 'debug')">
          <xsl:value-of select="map:get($settings, 'debug')"/>
        </xsl:if>
      </debug-value>
    </config>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<config>
  <has-debug>true</has-debug>
  <has-verbose>false</has-verbose>
  <debug-value>true</debug-value>
</config>
```

### Filtering a map by known keys

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="data" select="map{
      'name':'Alice', 'age':30, 'ssn':'123-45-6789', 'city':'Paris'
    }"/>
    <xsl:variable name="allowed" select="('name', 'age', 'city')"/>
    <safe-output>
      <xsl:for-each select="$allowed[map:contains($data, .)]">
        <xsl:element name="{.}">
          <xsl:value-of select="map:get($data, .)"/>
        </xsl:element>
      </xsl:for-each>
    </safe-output>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<safe-output>
  <name>Alice</name>
  <age>30</age>
  <city>Paris</city>
</safe-output>
```

## Notes

- Use `map:contains()` instead of `exists(map:get(...))` when a key may map to the empty sequence `()`.
- Key comparison is type-aware: `map:contains($m, 1)` and `map:contains($m, '1')` are different lookups.
- For checking multiple keys, combine with `every ... satisfies` or `some ... satisfies`.

## See also

- [map:get()](../xpath-map-get)
- [map:keys()](../xpath-map-keys)
- [map:size()](../xpath-map-size)
- [map:put()](../xpath-map-put)
- [xsl:map](../xsl-map)
