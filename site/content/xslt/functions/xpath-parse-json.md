---
title: "parse-json()"
description: "Parses a JSON string and returns the result as an XDM map, array, string, number, boolean, or empty sequence."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "JSON function"
syntax: "parse-json(string, options?)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`parse-json()` converts a JSON string into XDM values following the mapping defined in the XPath 3.1 specification: JSON objects become XDM maps, JSON arrays become XDM arrays, JSON strings become `xs:string`, JSON numbers become `xs:double`, JSON booleans become `xs:boolean`, and JSON `null` becomes the empty sequence.

The optional `options` argument is an XDM map controlling parsing behavior. The most commonly used option is `"liberal"` (a boolean that allows relaxed JSON syntax), and `"duplicates"` (controlling how duplicate object keys are handled: `"reject"`, `"use-first"`, or `"use-last"`).

The function is the inverse of `xml-to-json()` combined with `parse-xml()`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string? | Yes | A valid JSON string to parse. Returns empty sequence if the input is the empty sequence. |
| `options` | map(xs:string, item())? | No | A map of parsing options such as `"liberal"` and `"duplicates"`. |

## Return value

`item()?` — an XDM map, array, string, double, boolean, or the empty sequence (for JSON null), depending on the JSON content.

## Examples

### Parsing a JSON object

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <json>{"name": "Alice", "age": 30, "active": true}</json>
</data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <xsl:variable name="obj" select="parse-json(json)"/>
    <person>
      <name><xsl:value-of select="map:get($obj, 'name')"/></name>
      <age><xsl:value-of select="map:get($obj, 'age')"/></age>
      <active><xsl:value-of select="map:get($obj, 'active')"/></active>
    </person>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<person>
  <name>Alice</name>
  <age>30</age>
  <active>true</active>
</person>
```

### Parsing a JSON array

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="arr" select="parse-json('[1, 2, 3, 4, 5]')"/>
    <numbers>
      <xsl:for-each select="1 to array:size($arr)">
        <n><xsl:value-of select="array:get($arr, .)"/></n>
      </xsl:for-each>
    </numbers>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<numbers>
  <n>1</n>
  <n>2</n>
  <n>3</n>
  <n>4</n>
  <n>5</n>
</numbers>
```

## Notes

- JSON numbers are mapped to `xs:double`; large integers may lose precision. Use the `"number-parser"` option in XPath 3.1 to supply a custom number converter.
- JSON `null` maps to the empty sequence, not to a special null value. This means a JSON object with a `null` value and a missing key are indistinguishable after parsing with the default options.
- If the input string is not valid JSON, a dynamic error is raised unless `"liberal": true()` is set.
- The `"duplicates"` option defaults to `"use-first"` in most processors.

## See also

- [json-doc()](../xpath-json-doc)
- [json-to-xml()](../xpath-json-to-xml)
- [xml-to-json()](../xpath-xml-to-json)
- [serialize()](../xpath-serialize)
