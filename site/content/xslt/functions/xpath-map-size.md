---
title: "map:size()"
description: "Returns the number of key-value entries in a map."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "map function"
syntax: "map:size(map)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczptYXA9Imh0dHA6Ly93d3cudzMub3JnLzIwMDUveHBhdGgtZnVuY3Rpb25zL21hcCI-CgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0iY29uZmlnIiBzZWxlY3Q9Im1hcHsKICAgICAgJ2hvc3QnOiAnbG9jYWxob3N0JywKICAgICAgJ3BvcnQnOiA4MDgwLAogICAgICAnZGVidWcnOiB0cnVlKCkKICAgIH0iLz4KICAgIDxyZXN1bHQ-CiAgICAgIDxzaXplPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJtYXA6c2l6ZSgkY29uZmlnKSIvPjwvc2l6ZT4KICAgICAgPGVtcHR5Pjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJtYXA6c2l6ZShtYXB7fSkiLz48L2VtcHR5PgogICAgPC9yZXN1bHQ-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJlcXVlc3Q-CiAgPHBhcmFtIG5hbWU9Imhvc3QiPmV4YW1wbGUuY29tPC9wYXJhbT4KICA8cGFyYW0gbmFtZT0icG9ydCI-NDQzPC9wYXJhbT4KPC9yZXF1ZXN0Pg&version=3.0"
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
