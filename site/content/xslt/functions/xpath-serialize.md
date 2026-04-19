---
title: "serialize()"
description: "Serializes a node or sequence to a string using the W3C serialization specification and specified output parameters."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "JSON function"
syntax: "serialize(nodes, output-declaration?)"
tags: ["xslt", "reference", "xslt3", "xpath"]
---

## Description

`serialize()` converts an XDM sequence of nodes or atomic values to a string, using the W3C XSLT/XQuery serialization specification. It is the programmatic equivalent of the output written by the stylesheet itself, but it produces a string value that can be stored in a variable, inserted into content, or written to a secondary result tree.

The optional second argument is an output declaration: either an `xsl:output` element node (produced with `xsl:output` and referenced via the `output:` namespace) or a map of serialization parameter names to values. Common parameters include `method` (`"xml"`, `"html"`, `"text"`, `"json"`), `indent`, `encoding`, and `omit-xml-declaration`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nodes` | `item()*` | Yes | The sequence of nodes or atomic values to serialize. |
| `output-declaration` | `item()?` | No | An `xsl:output` element or a `map(xs:string, item()*)` of serialization parameters. |

## Return value

`xs:string` — the serialized representation of the input as a string.

## Examples

### Serializing an XML fragment to a string for embedding

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<page>
  <title>Hello</title>
  <body>World</body>
</page>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/page">
    <xsl:variable name="xml-string"
      select="serialize(., map{'method':'xml','indent':true(),'omit-xml-declaration':true()})"/>
    <document>
      <source-as-text><xsl:value-of select="$xml-string"/></source-as-text>
      <length><xsl:value-of select="string-length($xml-string)"/></length>
    </document>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<document>
  <source-as-text>&lt;page&gt;
  &lt;title&gt;Hello&lt;/title&gt;
  &lt;body&gt;World&lt;/body&gt;
&lt;/page&gt;</source-as-text>
  <length>47</length>
</document>
```

### Serializing XML data to JSON format

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<items>
  <item key="name">Widget</item>
  <item key="price">9.99</item>
  <item key="in-stock">true</item>
</items>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:fn="http://www.w3.org/2005/xpath-functions">

  <xsl:output method="text"/>

  <xsl:template match="/items">
    <xsl:variable name="xml-json">
      <fn:map>
        <fn:string key="name"><xsl:value-of select="item[@key='name']"/></fn:string>
        <fn:number key="price"><xsl:value-of select="item[@key='price']"/></fn:number>
        <fn:boolean key="in-stock"><xsl:value-of select="item[@key='in-stock']"/></fn:boolean>
      </fn:map>
    </xsl:variable>
    <xsl:value-of select="serialize($xml-json, map{'method':'json','indent':true()})"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```json
{
  "name": "Widget",
  "price": 9.99,
  "in-stock": true
}
```

## Notes

- When the `method` is `"json"`, the input must be a single node in the W3C JSON-XML format (same as `xml-to-json()` accepts). Use `xml-to-json()` directly for this case if you do not need other serialization control.
- `serialize()` is often used in combination with `result-document` alternatives: when you need the XML string inside the transformation rather than written to a file.
- Atomic values in the input sequence are serialized using their string representation, separated by spaces by default.
- The `map` form of the second argument uses the same parameter names as `xsl:output` attributes, but as strings: `"indent"`, `"method"`, `"omit-xml-declaration"`, `"encoding"`, etc.

## See also

- [xsl:output](../xsl-output)
- [xml-to-json()](../xpath-xml-to-json)
