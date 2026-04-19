---
title: "map:size()"
description: "Returns the number of key-value entries in a map."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "map function"
syntax: "map:size(map)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`map:size()` returns the count of entries (key-value pairs) in a map as an `xs:integer`. An empty map returns `0`. This is the map equivalent of `count()` for sequences.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `map` | map(*) | Yes | The map whose entry count is to be returned. |

## Return value

`xs:integer` — the number of entries in the map; `0` for an empty map.

## Examples

### Counting entries in a map

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="config" select="map{
      'host': 'localhost',
      'port': 8080,
      'debug': true()
    }"/>
    <result>
      <size><xsl:value-of select="map:size($config)"/></size>
      <empty><xsl:value-of select="map:size(map{})"/></empty>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <size>3</size>
  <empty>0</empty>
</result>
```

### Using size to validate a map before processing

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<request>
  <param name="host">example.com</param>
  <param name="port">443</param>
</request>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/request">
    <xsl:variable name="params" select="map:merge(
      for $p in param return map:entry($p/@name, $p/text())
    )"/>
    <status>
      <param-count><xsl:value-of select="map:size($params)"/></param-count>
      <valid><xsl:value-of select="map:size($params) ge 2"/></valid>
    </status>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<status>
  <param-count>2</param-count>
  <valid>true</valid>
</status>
```

## Notes

- `map:size()` is O(1) in most implementations.
- Use `map:size($m) = 0` to check for an empty map (or compare with `map{}`).
- The function counts top-level keys only; nested maps inside values count as one entry each.

## See also

- [map:keys()](../xpath-map-keys)
- [map:get()](../xpath-map-get)
- [map:contains()](../xpath-map-contains)
- [map:merge()](../xpath-map-merge)
- [xsl:map](../xsl-map)
