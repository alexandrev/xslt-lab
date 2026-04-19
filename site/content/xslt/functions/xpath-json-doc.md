---
title: "json-doc()"
description: "Retrieves a JSON document from a URI and parses it into XDM value using the same rules as parse-json()."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "JSON function"
syntax: "json-doc(uri, options?)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`json-doc()` loads a JSON document from a URI and returns it as an XDM value using the same mapping rules as `parse-json()`. JSON objects become XDM maps, JSON arrays become XDM arrays, and scalar JSON values become corresponding XDM atomic types. The function is the JSON counterpart to `doc()` for XML documents.

The `options` map accepts the same keys as `parse-json()`. The URI is resolved against the base URI of the stylesheet. If the URI cannot be dereferenced or the content is not valid JSON, a dynamic error is raised.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uri` | xs:string? | Yes | The URI of the JSON resource to load. Returns empty sequence if the URI is the empty sequence. |
| `options` | map(xs:string, item())? | No | Parsing options, same as for parse-json(). |

## Return value

`item()?` — the parsed JSON content as an XDM map, array, or atomic value.

## Examples

### Loading a JSON configuration file

**JSON file (config.json):**
```json
{
  "host": "db.example.com",
  "port": 5432,
  "database": "production"
}
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="cfg" select="json-doc('config.json')"/>
    <config>
      <host><xsl:value-of select="map:get($cfg, 'host')"/></host>
      <port><xsl:value-of select="map:get($cfg, 'port')"/></port>
      <database><xsl:value-of select="map:get($cfg, 'database')"/></database>
    </config>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<config>
  <host>db.example.com</host>
  <port>5432</port>
  <database>production</database>
</config>
```

### Loading a JSON array from a URL

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="items" select="json-doc('https://api.example.com/items')"/>
    <items>
      <xsl:for-each select="1 to array:size($items)">
        <xsl:variable name="item" select="array:get($items, .)"/>
        <item name="{map:get($item, 'name')}"/>
      </xsl:for-each>
    </items>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<items>
  <item name="Widget"/>
  <item name="Gadget"/>
</items>
```

## Notes

- `json-doc()` caches results in the same way as `doc()`; multiple calls with the same URI within a transformation return the same XDM value.
- Unlike `doc()`, the result is not a node tree but an XDM atomic or composite value, so you cannot navigate it with XPath axis steps.
- The function is not available in XSLT 2.0; use `parse-json(unparsed-text(uri))` as a workaround in 2.0 processors that support `unparsed-text()`.
- Relative URIs are resolved against the static base URI of the calling expression.

## See also

- [parse-json()](../xpath-parse-json)
- [json-to-xml()](../xpath-json-to-xml)
- [xml-to-json()](../xpath-xml-to-json)
