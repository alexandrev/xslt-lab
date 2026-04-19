---
title: "map:remove()"
description: "Returns a new map with one or more specified keys removed, leaving the original map unchanged."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "map function"
syntax: "map:remove(map, keys)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczptYXA9Imh0dHA6Ly93d3cudzMub3JnLzIwMDUveHBhdGgtZnVuY3Rpb25zL21hcCI-CgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvIj4KICAgIDx4c2w6dmFyaWFibGUgbmFtZT0idXNlciIgc2VsZWN0PSJtYXB7CiAgICAgICduYW1lJzogJ0FsaWNlJywKICAgICAgJ2VtYWlsJzogJ2FsaWNlQGV4YW1wbGUuY29tJywKICAgICAgJ3Bhc3N3b3JkJzogJ3NlY3JldDEyMycKICAgIH0iLz4KICAgIDwhLS0gUmVtb3ZlIHNlbnNpdGl2ZSBmaWVsZCBiZWZvcmUgb3V0cHV0IC0tPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJzYWZlIiBzZWxlY3Q9Im1hcDpyZW1vdmUoJHVzZXIsICdwYXNzd29yZCcpIi8-CiAgICA8dXNlcj4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9InNvcnQobWFwOmtleXMoJHNhZmUpKSI-CiAgICAgICAgPHhzbDplbGVtZW50IG5hbWU9InsufSI-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Im1hcDpnZXQoJHNhZmUsIC4pIi8-PC94c2w6ZWxlbWVudD4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L3VzZXI-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
---

## Description

`map:remove()` produces a new map that contains all entries from the input map except those whose keys appear in the `keys` sequence. If a key in `keys` is not present in the map, it is silently ignored. Maps are immutable; the original is not modified.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `map` | map(*) | Yes | The source map. |
| `keys` | xs:anyAtomicType* | Yes | A sequence of keys to remove. |

## Return value

`map(*)` — a new map with the specified keys removed.

## Examples

### Removing a single key

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="user" select="map{
      'name': 'Alice',
      'email': 'alice@example.com',
      'password': 'secret123'
    }"/>
    <!-- Remove sensitive field before output -->
    <xsl:variable name="safe" select="map:remove($user, 'password')"/>
    <user>
      <xsl:for-each select="sort(map:keys($safe))">
        <xsl:element name="{.}"><xsl:value-of select="map:get($safe, .)"/></xsl:element>
      </xsl:for-each>
    </user>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<user>
  <email>alice@example.com</email>
  <name>Alice</name>
</user>
```

### Removing multiple keys at once

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="record" select="map{
      'id':1, 'name':'Bob', 'ssn':'999-99-9999',
      'dob':'1990-01-01', 'city':'London'
    }"/>
    <xsl:variable name="private-keys" select="('ssn', 'dob')"/>
    <xsl:variable name="public" select="map:remove($record, $private-keys)"/>
    <public-record size="{map:size($public)}">
      <xsl:for-each select="sort(map:keys($public))">
        <field name="{.}"><xsl:value-of select="map:get($public, .)"/></field>
      </xsl:for-each>
    </public-record>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<public-record size="3">
  <field name="city">London</field>
  <field name="id">1</field>
  <field name="name">Bob</field>
</public-record>
```

## Notes

- Removing a non-existent key is not an error; it is silently ignored.
- Maps are immutable; `map:remove()` always returns a new map.
- To remove all keys, use `map:remove($m, map:keys($m))`, which returns an empty map.

## See also

- [map:put()](../xpath-map-put)
- [map:get()](../xpath-map-get)
- [map:contains()](../xpath-map-contains)
- [map:keys()](../xpath-map-keys)
- [map:merge()](../xpath-map-merge)
- [xsl:map](../xsl-map)
