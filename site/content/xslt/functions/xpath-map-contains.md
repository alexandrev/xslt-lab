---
title: "map:contains()"
description: "Returns true if a map contains an entry with the specified key, false otherwise."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "map function"
syntax: "map:contains(map, key)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczptYXA9Imh0dHA6Ly93d3cudzMub3JnLzIwMDUveHBhdGgtZnVuY3Rpb25zL21hcCI-CgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0ic2V0dGluZ3MiIHNlbGVjdD0ibWFwewogICAgICAnZGVidWcnOiB0cnVlKCksCiAgICAgICd0aW1lb3V0JzogMzAKICAgIH0iLz4KICAgIDxjb25maWc-CiAgICAgIDxoYXMtZGVidWc-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Im1hcDpjb250YWlucygkc2V0dGluZ3MsICdkZWJ1ZycpIi8-PC9oYXMtZGVidWc-CiAgICAgIDxoYXMtdmVyYm9zZT48eHNsOnZhbHVlLW9mIHNlbGVjdD0ibWFwOmNvbnRhaW5zKCRzZXR0aW5ncywgJ3ZlcmJvc2UnKSIvPjwvaGFzLXZlcmJvc2U-CiAgICAgIDxkZWJ1Zy12YWx1ZT4KICAgICAgICA8eHNsOmlmIHRlc3Q9Im1hcDpjb250YWlucygkc2V0dGluZ3MsICdkZWJ1ZycpIj4KICAgICAgICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJtYXA6Z2V0KCRzZXR0aW5ncywgJ2RlYnVnJykiLz4KICAgICAgICA8L3hzbDppZj4KICAgICAgPC9kZWJ1Zy12YWx1ZT4KICAgIDwvY29uZmlnPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
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
