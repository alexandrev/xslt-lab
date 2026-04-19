---
title: "map:keys()"
description: "Returns all keys of a map as a sequence of atomic values in implementation-defined order."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "map function"
syntax: "map:keys(map)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczptYXA9Imh0dHA6Ly93d3cudzMub3JnLzIwMDUveHBhdGgtZnVuY3Rpb25zL21hcCI-CgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0ic2NvcmVzIiBzZWxlY3Q9Im1hcHsKICAgICAgJ0FsaWNlJzogOTUsCiAgICAgICdCb2InOiA4MiwKICAgICAgJ0Nhcm9sJzogOTEKICAgIH0iLz4KICAgIDxyZXBvcnQ-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJzb3J0KG1hcDprZXlzKCRzY29yZXMpKSI-CiAgICAgICAgPHN0dWRlbnQgbmFtZT0iey59IiBzY29yZT0ie21hcDpnZXQoJHNjb3JlcywgLil9Ii8-CiAgICAgIDwveHNsOmZvci1lYWNoPgogICAgPC9yZXBvcnQ-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
---

## Description

`map:keys()` returns a sequence containing all the keys present in a map. The order of keys in the result is implementation-defined and should not be relied upon. Keys are always atomic values (`xs:anyAtomicType`). For an empty map, the empty sequence is returned.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `map` | map(*) | Yes | The map whose keys are to be returned. |

## Return value

`xs:anyAtomicType*` — a sequence of all keys in the map; empty sequence for an empty map.

## Examples

### Iterating over all map keys

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="scores" select="map{
      'Alice': 95,
      'Bob': 82,
      'Carol': 91
    }"/>
    <report>
      <xsl:for-each select="sort(map:keys($scores))">
        <student name="{.}" score="{map:get($scores, .)}"/>
      </xsl:for-each>
    </report>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<report>
  <student name="Alice" score="95"/>
  <student name="Bob" score="82"/>
  <student name="Carol" score="91"/>
</report>
```

### Converting a map to XML elements

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="config" select="map{
      'theme': 'dark',
      'lang': 'en',
      'version': '3.0'
    }"/>
    <config>
      <xsl:for-each select="sort(map:keys($config))">
        <xsl:element name="{.}">
          <xsl:value-of select="map:get($config, .)"/>
        </xsl:element>
      </xsl:for-each>
    </config>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<config>
  <lang>en</lang>
  <theme>dark</theme>
  <version>3.0</version>
</config>
```

## Notes

- The order of keys is not guaranteed; wrap with `sort()` for deterministic output.
- Keys can be any atomic type: `xs:string`, `xs:integer`, `xs:date`, etc.
- Duplicate keys cannot exist in a map, so `count(map:keys($m))` always equals `map:size($m)`.

## See also

- [map:get()](../xpath-map-get)
- [map:contains()](../xpath-map-contains)
- [map:size()](../xpath-map-size)
- [map:merge()](../xpath-map-merge)
- [xsl:map](../xsl-map)
