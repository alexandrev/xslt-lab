---
title: "xsl:map"
description: "Creates an XDM map from one or more xsl:map-entry children, enabling key-value data structures directly in XSLT 3.0 stylesheets."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:map><xsl:map-entry .../></xsl:map>"
tags: ["xslt", "reference", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiCiAgeG1sbnM6bWFwPSJodHRwOi8vd3d3LnczLm9yZy8yMDA1L3hwYXRoLWZ1bmN0aW9ucy9tYXAiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvcHJvZHVjdHMiPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJwcmljZS1tYXAiPgogICAgICA8eHNsOm1hcD4KICAgICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0icHJvZHVjdCI-CiAgICAgICAgICA8eHNsOm1hcC1lbnRyeSBrZXk9IkBpZCIgc2VsZWN0PSJ4czpkZWNpbWFsKEBwcmljZSkiLz4KICAgICAgICA8L3hzbDpmb3ItZWFjaD4KICAgICAgPC94c2w6bWFwPgogICAgPC94c2w6dmFyaWFibGU-CiAgICA8cHJpY2VzPgogICAgICA8aXRlbSBpZD0iUDAwMSI-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Im1hcDpnZXQoJHByaWNlLW1hcCwgJ1AwMDEnKSIvPjwvaXRlbT4KICAgICAgPGl0ZW0gaWQ9IlA5OTkiPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIobWFwOmdldCgkcHJpY2UtbWFwLCAnUDk5OScpLCAnTi9BJylbMV0iLz48L2l0ZW0-CiAgICA8L3ByaWNlcz4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHByb2R1Y3RzPgogIDxwcm9kdWN0IGlkPSJQMDAxIiBwcmljZT0iMTkuOTkiLz4KICA8cHJvZHVjdCBpZD0iUDAwMiIgcHJpY2U9IjQuNTAiLz4KICA8cHJvZHVjdCBpZD0iUDAwMyIgcHJpY2U9IjEyOS4wMCIvPgo8L3Byb2R1Y3RzPg&version=3.0"
---

## Description

`xsl:map` is the instruction form for constructing an XDM map — an unordered collection of key-value pairs where keys are atomic values and values can be any XDM sequence. Maps were added to XDM in version 3.1 and are central to working with JSON in XSLT 3.0.

The instruction form `xsl:map` is an alternative to the XPath constructor `map{key: value, ...}`. Use the instruction form when you want to build a map from dynamic content using sequence constructors, loops, or conditional logic. You can mix `xsl:map-entry` children with `xsl:if`, `xsl:for-each`, and other instructions to build the map programmatically.

Maps are immutable but can be merged using XPath `map:merge()`. They are particularly useful as lookup tables, configuration objects passed to named templates, and intermediate data structures when generating JSON output via `xsl:output method="json"`.

Keys must be atomic values and must be unique within a map. Attempting to add duplicate keys raises an error unless you use `map:merge()` with an appropriate `duplicates` option.

## Attributes

`xsl:map` has no element-specific attributes. Its content must consist of `xsl:map-entry` instructions (and other XSLT instructions that produce map entries).

## Examples

### Building a lookup table from XML data

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product id="P001" price="19.99"/>
  <product id="P002" price="4.50"/>
  <product id="P003" price="129.00"/>
</products>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/products">
    <xsl:variable name="price-map">
      <xsl:map>
        <xsl:for-each select="product">
          <xsl:map-entry key="@id" select="xs:decimal(@price)"/>
        </xsl:for-each>
      </xsl:map>
    </xsl:variable>
    <prices>
      <item id="P001"><xsl:value-of select="map:get($price-map, 'P001')"/></item>
      <item id="P999"><xsl:value-of select="(map:get($price-map, 'P999'), 'N/A')[1]"/></item>
    </prices>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<prices>
  <item id="P001">19.99</item>
  <item id="P999">N/A</item>
</prices>
```

### Generating JSON output from a map

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="json" indent="yes"/>

  <xsl:template match="/products">
    <xsl:map>
      <xsl:map-entry key="'count'" select="count(product)"/>
      <xsl:map-entry key="'ids'">
        <xsl:sequence select="array{product/@id/string()}"/>
      </xsl:map-entry>
      <xsl:map-entry key="'generated'" select="string(current-dateTime())"/>
    </xsl:map>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `xsl:map` produces a single map item, not a sequence of nodes. You cannot mix map entries and node constructors in the same `xsl:map`.
- The XPath expression form `map{k1: v1, k2: v2}` is equivalent and more concise when the keys and values are known at compile time.
- To merge two maps, use the XPath function `map:merge(($map1, $map2))`.
- Maps are not serialised by default in XML output mode; to include them in output, convert to XML or use JSON output.

## See also

- [xsl:map-entry](../xsl-map-entry)
- [map:get()](../xpath-map-get)
- [map:merge()](../xpath-map-merge)
