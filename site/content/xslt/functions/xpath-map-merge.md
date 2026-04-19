---
title: "map:merge()"
description: "Merges multiple maps into one, with duplicate key handling controlled by an options map."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "map function"
syntax: "map:merge(maps, options?)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczptYXA9Imh0dHA6Ly93d3cudzMub3JnLzIwMDUveHBhdGgtZnVuY3Rpb25zL21hcCI-CgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0iZGVmYXVsdHMiIHNlbGVjdD0ibWFweydjb2xvcic6J2JsdWUnLCAnc2l6ZSc6J21lZGl1bScsICd3ZWlnaHQnOjF9Ii8-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9Im92ZXJyaWRlcyIgc2VsZWN0PSJtYXB7J2NvbG9yJzoncmVkJywgJ3dlaWdodCc6NX0iLz4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0ibWVyZ2VkIiBzZWxlY3Q9Im1hcDptZXJnZSgoJGRlZmF1bHRzLCAkb3ZlcnJpZGVzKSkiLz4KICAgIDxjb25maWc-CiAgICAgIDxjb2xvcj48eHNsOnZhbHVlLW9mIHNlbGVjdD0ibWFwOmdldCgkbWVyZ2VkLCAnY29sb3InKSIvPjwvY29sb3I-CiAgICAgIDxzaXplPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJtYXA6Z2V0KCRtZXJnZWQsICdzaXplJykiLz48L3NpemU-CiAgICAgIDx3ZWlnaHQ-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Im1hcDpnZXQoJG1lcmdlZCwgJ3dlaWdodCcpIi8-PC93ZWlnaHQ-CiAgICA8L2NvbmZpZz4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
---

## Description

`map:merge()` combines a sequence of maps into a single map. When two or more maps share the same key, the behavior is controlled by the `duplicates` option. The function is immutable — the input maps are not modified; a new map is returned.

The `duplicates` option accepts: `"reject"` (error), `"use-first"`, `"use-last"` (default), `"combine"` (values become a sequence), or `"unspecified"`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `maps` | map(*)*  | Yes | A sequence of maps to merge. |
| `options` | map(xs:string, item())? | No | Options map; key `"duplicates"` controls duplicate handling. |

## Return value

`map(*)` — a new map containing all entries from the input maps.

## Examples

### Merging two maps with use-last (default)

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="defaults" select="map{'color':'blue', 'size':'medium', 'weight':1}"/>
    <xsl:variable name="overrides" select="map{'color':'red', 'weight':5}"/>
    <xsl:variable name="merged" select="map:merge(($defaults, $overrides))"/>
    <config>
      <color><xsl:value-of select="map:get($merged, 'color')"/></color>
      <size><xsl:value-of select="map:get($merged, 'size')"/></size>
      <weight><xsl:value-of select="map:get($merged, 'weight')"/></weight>
    </config>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<config>
  <color>red</color>
  <size>medium</size>
  <weight>5</weight>
</config>
```

### Merging with combine to accumulate duplicate values

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="m1" select="map{'tag':'xslt', 'tag2':'xml'}"/>
    <xsl:variable name="m2" select="map{'tag':'xpath'}"/>
    <xsl:variable name="merged" select="map:merge(($m1, $m2),
      map{'duplicates':'combine'})"/>
    <tags>
      <xsl:for-each select="map:get($merged, 'tag')">
        <tag><xsl:value-of select="."/></tag>
      </xsl:for-each>
    </tags>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<tags>
  <tag>xslt</tag>
  <tag>xpath</tag>
</tags>
```

## Notes

- The default duplicate behavior (`use-last`) means later maps in the input sequence win.
- `"reject"` causes `err:FOJS0003` when a duplicate key is encountered.
- `map:merge()` also accepts an empty sequence, returning an empty map.
- Maps are immutable in XDM; merge always produces a new map.

## See also

- [map:put()](../xpath-map-put)
- [map:remove()](../xpath-map-remove)
- [map:get()](../xpath-map-get)
- [map:keys()](../xpath-map-keys)
- [map:size()](../xpath-map-size)
- [xsl:map](../xsl-map)
