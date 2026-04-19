---
title: "map:put()"
description: "Returns a new map with a key-value entry added or updated, leaving the original map unchanged."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "map function"
syntax: "map:put(map, key, value)"
tags: ["xslt", "reference", "xpath", "xslt3"]
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
