---
title: "xsl:map-entry"
description: "Adds a single key-value pair to an xsl:map, where the key is any atomic value and the value is any XDM sequence."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: '<xsl:map-entry key="expression" select="expression"/>'
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:map-entry` contributes a single key-value pair to the enclosing `xsl:map`. The `key` attribute is an XPath expression that must evaluate to a single atomic value — strings, integers, dates, and QNames are all valid key types. The value is provided either via the `select` attribute or via a sequence constructor in the element content.

Because `xsl:map-entry` is an XSLT instruction, you can use it inside `xsl:for-each` to programmatically add entries, or inside `xsl:if`/`xsl:choose` to conditionally include entries. This makes `xsl:map-entry` more flexible than the XPath `map{...}` constructor syntax when the data is dynamic.

Keys within a single map must be distinct. Two atomic values are equal as map keys if they are equal according to the `eq` operator with the same implicit timezone. If the same key appears twice in the `xsl:map`, the processor raises error `XTDE3365`.

The value can be any XDM sequence including the empty sequence, nodes, arrays, and even nested maps, making `xsl:map-entry` the building block for arbitrarily nested data structures.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `key` | expression | Yes | XPath expression evaluating to a single atomic value. |
| `select` | expression | No | XPath expression providing the map value. If absent, the content sequence constructor is used. |

## Examples

### Building a map conditionally

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>
  <param name="timeout" value="30"/>
  <param name="debug" value="true"/>
  <param name="retries" value="3"/>
</config>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/config">
    <xsl:variable name="settings">
      <xsl:map>
        <xsl:for-each select="param">
          <xsl:map-entry key="string(@name)" select="string(@value)"/>
        </xsl:for-each>
      </xsl:map>
    </xsl:variable>
    <resolved>
      <timeout><xsl:value-of select="map:get($settings, 'timeout')"/></timeout>
      <debug><xsl:value-of select="map:get($settings, 'debug')"/></debug>
    </resolved>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<resolved>
  <timeout>30</timeout>
  <debug>true</debug>
</resolved>
```

### Nested maps for structured data

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="json" indent="yes"/>

  <xsl:template match="/person">
    <xsl:map>
      <xsl:map-entry key="'name'" select="string(name)"/>
      <xsl:map-entry key="'age'" select="xs:integer(age)"/>
      <xsl:map-entry key="'address'">
        <xsl:map>
          <xsl:map-entry key="'city'" select="string(address/city)"/>
          <xsl:map-entry key="'country'" select="string(address/country)"/>
        </xsl:map>
      </xsl:map-entry>
    </xsl:map>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- If the `key` expression returns more than one atomic value, error `XTTE3360` is raised.
- If the `key` expression returns a node, it is atomised to its typed value automatically.
- An empty-sequence key raises an error; use `(expr, '')[1]` to provide a fallback.
- When using integer keys, beware that `1` (xs:integer) and `1.0` (xs:decimal) are equal as map keys.

## See also

- [xsl:map](../xsl-map)
- [map:get()](../xpath-map-get)
- [map:merge()](../xpath-map-merge)
