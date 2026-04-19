---
title: "map:entry()"
description: "Creates a singleton map containing exactly one key-value pair."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "map function"
syntax: "map:entry(key, value)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczptYXA9Imh0dHA6Ly93d3cudzMub3JnLzIwMDUveHBhdGgtZnVuY3Rpb25zL21hcCI-CgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvY29uZmlnIj4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0iY2ZnIiBzZWxlY3Q9Im1hcDptZXJnZSgKICAgICAgZm9yICRlIGluIGVudHJ5IHJldHVybiBtYXA6ZW50cnkoc3RyaW5nKCRlL0BrZXkpLCBzdHJpbmcoJGUpKQogICAgKSIvPgogICAgPHJlc3VsdD4KICAgICAgPGhvc3Q-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Im1hcDpnZXQoJGNmZywgJ2hvc3QnKSIvPjwvaG9zdD4KICAgICAgPHBvcnQ-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Im1hcDpnZXQoJGNmZywgJ3BvcnQnKSIvPjwvcG9ydD4KICAgICAgPHRscz48eHNsOnZhbHVlLW9mICBzZWxlY3Q9Im1hcDpnZXQoJGNmZywgJ3RscycpIi8-PC90bHM-CiAgICA8L3Jlc3VsdD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNvbmZpZz4KICA8ZW50cnkga2V5PSJob3N0Ij5leGFtcGxlLmNvbTwvZW50cnk-CiAgPGVudHJ5IGtleT0icG9ydCI-NDQzPC9lbnRyeT4KICA8ZW50cnkga2V5PSJ0bHMiPnRydWU8L2VudHJ5Pgo8L2NvbmZpZz4&version=3.0"
---

## Description

`map:entry()` constructs a map with a single key-value entry. It is primarily useful when building maps programmatically — for example, inside `for` expressions or `fold-left()` accumulations — and then combining the singleton maps with `map:merge()`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | xs:anyAtomicType | Yes | The key of the entry. |
| `value` | item()* | Yes | The value to associate with the key. |

## Return value

`map(xs:anyAtomicType, item()*)` — a singleton map with one entry.

## Examples

### Building a map from XML nodes

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>
  <entry key="host">example.com</entry>
  <entry key="port">443</entry>
  <entry key="tls">true</entry>
</config>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/config">
    <xsl:variable name="cfg" select="map:merge(
      for $e in entry return map:entry(string($e/@key), string($e))
    )"/>
    <result>
      <host><xsl:value-of select="map:get($cfg, 'host')"/></host>
      <port><xsl:value-of select="map:get($cfg, 'port')"/></port>
      <tls><xsl:value-of  select="map:get($cfg, 'tls')"/></tls>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <host>example.com</host>
  <port>443</port>
  <tls>true</tls>
</result>
```

### Accumulating a frequency map

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="words" select="('cat', 'dog', 'cat', 'bird', 'dog', 'cat')"/>
    <xsl:variable name="freq" select="fold-left($words, map{},
      function($acc, $w) {
        map:put($acc, $w, (map:get($acc, $w), 0)[1] + 1)
      }
    )"/>
    <frequencies>
      <xsl:for-each select="sort(map:keys($freq))">
        <word count="{map:get($freq, .)}"><xsl:value-of select="."/></word>
      </xsl:for-each>
    </frequencies>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<frequencies>
  <word count="1">bird</word>
  <word count="2">dog</word>
  <word count="3">cat</word>
</frequencies>
```

## Notes

- `map:entry($k, $v)` is equivalent to the map constructor `map{$k: $v}`.
- Particularly useful inside `for` expressions where the map constructor syntax is awkward.
- Combine multiple `map:entry()` results with `map:merge()` to build larger maps.

## See also

- [map:get()](../xpath-map-get)
- [map:put()](../xpath-map-put)
- [map:merge()](../xpath-map-merge)
- [xsl:map](../xsl-map)
- [xsl:map-entry](../xsl-map-entry)
