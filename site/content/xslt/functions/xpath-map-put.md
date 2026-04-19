---
title: "map:put()"
description: "Returns a new map with a key-value entry added or updated, leaving the original map unchanged."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "map function"
syntax: "map:put(map, key, value)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczptYXA9Imh0dHA6Ly93d3cudzMub3JnLzIwMDUveHBhdGgtZnVuY3Rpb25zL21hcCI-CgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0ibTAiIHNlbGVjdD0ibWFweydhJzoxLCAnYic6Mn0iLz4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0ibTEiIHNlbGVjdD0ibWFwOnB1dCgkbTAsICdjJywgMykiLz4gICA8IS0tIGFkZCBuZXcga2V5IC0tPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJtMiIgc2VsZWN0PSJtYXA6cHV0KCRtMSwgJ2EnLCA5OSkiLz4gIDwhLS0gdXBkYXRlIGV4aXN0aW5nIC0tPgogICAgPHJlc3VsdD4KICAgICAgPHNpemU-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Im1hcDpzaXplKCRtMikiLz48L3NpemU-CiAgICAgIDxhPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJtYXA6Z2V0KCRtMiwgJ2EnKSIvPjwvYT4KICAgICAgPGI-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Im1hcDpnZXQoJG0yLCAnYicpIi8-PC9iPgogICAgICA8Yz48eHNsOnZhbHVlLW9mIHNlbGVjdD0ibWFwOmdldCgkbTIsICdjJykiLz48L2M-CiAgICA8L3Jlc3VsdD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHNldHRpbmdzPgogIDxpdGVtIGtleT0iaG9zdCI-bG9jYWxob3N0PC9pdGVtPgogIDxpdGVtIGtleT0icG9ydCI-ODA4MDwvaXRlbT4KICA8aXRlbSBrZXk9ImRlYnVnIj50cnVlPC9pdGVtPgo8L3NldHRpbmdzPg&version=3.0"
---

## Description

`map:put()` produces a new map that is identical to the input map except that the given key is associated with the given value. If the key already exists, its value is replaced. If the key is new, the entry is added. Maps are immutable in XDM; the original map is never modified.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `map` | map(*) | Yes | The source map. |
| `key` | xs:anyAtomicType | Yes | The key to add or update. |
| `value` | item()* | Yes | The value to associate with the key. |

## Return value

`map(*)` — a new map with the specified key-value pair added or updated.

## Examples

### Adding and updating map entries

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="m0" select="map{'a':1, 'b':2}"/>
    <xsl:variable name="m1" select="map:put($m0, 'c', 3)"/>   <!-- add new key -->
    <xsl:variable name="m2" select="map:put($m1, 'a', 99)"/>  <!-- update existing -->
    <result>
      <size><xsl:value-of select="map:size($m2)"/></size>
      <a><xsl:value-of select="map:get($m2, 'a')"/></a>
      <b><xsl:value-of select="map:get($m2, 'b')"/></b>
      <c><xsl:value-of select="map:get($m2, 'c')"/></c>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <size>3</size>
  <a>99</a>
  <b>2</b>
  <c>3</c>
</result>
```

### Building a map incrementally from XML

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings>
  <item key="host">localhost</item>
  <item key="port">8080</item>
  <item key="debug">true</item>
</settings>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/settings">
    <xsl:variable name="config" select="fold-left(item, map{},
      function($acc, $item) { map:put($acc, string($item/@key), string($item)) }
    )"/>
    <config>
      <host><xsl:value-of select="map:get($config, 'host')"/></host>
      <port><xsl:value-of select="map:get($config, 'port')"/></port>
    </config>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<config>
  <host>localhost</host>
  <port>8080</port>
</config>
```

## Notes

- Maps are immutable; `map:put()` never modifies the original map.
- Equivalent to `map:merge(($map, map:entry($key, $value)))` with `duplicates: use-last`.
- Chain multiple `map:put()` calls to build up a map from individual entries.

## See also

- [map:get()](../xpath-map-get)
- [map:remove()](../xpath-map-remove)
- [map:entry()](../xpath-map-entry)
- [map:merge()](../xpath-map-merge)
- [xsl:map](../xsl-map)
- [xsl:map-entry](../xsl-map-entry)
