---
title: "xml-to-json()"
description: "Converts the W3C XML representation of JSON back to a JSON string, reversing json-to-xml()."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "JSON function"
syntax: "xml-to-json(node, options?)"
tags: ["xslt", "reference", "xslt3", "xpath"]
---

## Description

`xml-to-json()` converts an XML node tree in the W3C JSON-to-XML format back into a JSON string. It is the inverse of `json-to-xml()`. The input must be a node (element or document node) whose structure follows the W3C mapping: `<map>`, `<array>`, `<string>`, `<number>`, `<boolean>`, and `<null>` elements in the namespace `http://www.w3.org/2005/xpath-functions`.

The function is useful when you need to manipulate JSON content using standard XSLT tree-transformation techniques and then serialize the result back to JSON. The `options` map accepts an `"indent"` key (boolean) to produce pretty-printed output.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `node` | `node()?` | Yes | An element or document node in the W3C JSON-XML format. Empty input returns the empty sequence. |
| `options` | `map(xs:string, item()*)` | No | Output options. `"indent"` (boolean, default false) produces pretty-printed JSON. |

## Return value

`xs:string?` — the JSON serialization of the input node tree, or empty sequence if the input is empty.

## Examples

### Round-tripping JSON through XML transformation

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data/>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:fn="http://www.w3.org/2005/xpath-functions">

  <xsl:output method="text"/>

  <xsl:template match="/">
    <!-- Parse JSON to XML tree -->
    <xsl:variable name="json" select="'{&quot;status&quot;:&quot;draft&quot;,&quot;count&quot;:3}'"/>
    <xsl:variable name="xml" select="json-to-xml($json)"/>

    <!-- Modify the XML tree: change status to published -->
    <xsl:variable name="modified">
      <xsl:apply-templates select="$xml" mode="update"/>
    </xsl:variable>

    <!-- Serialize back to JSON -->
    <xsl:value-of select="xml-to-json($modified)"/>
  </xsl:template>

  <xsl:template match="fn:string[@key='status']" mode="update">
    <fn:string key="status">published</fn:string>
  </xsl:template>

  <xsl:template match="node()|@*" mode="update">
    <xsl:copy>
      <xsl:apply-templates select="node()|@*" mode="update"/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
{"status":"published","count":3}
```

### Building a JSON response from XML data

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<orders>
  <order id="1" total="99.50" currency="EUR"/>
  <order id="2" total="149.00" currency="USD"/>
</orders>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:fn="http://www.w3.org/2005/xpath-functions">

  <xsl:output method="text"/>

  <xsl:template match="/orders">
    <xsl:variable name="xml-json">
      <fn:array>
        <xsl:for-each select="order">
          <fn:map>
            <fn:number key="id"><xsl:value-of select="@id"/></fn:number>
            <fn:number key="total"><xsl:value-of select="@total"/></fn:number>
            <fn:string key="currency"><xsl:value-of select="@currency"/></fn:string>
          </fn:map>
        </xsl:for-each>
      </fn:array>
    </xsl:variable>
    <xsl:value-of select="xml-to-json($xml-json, map{'indent': true()})"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```json
[
  {
    "id": 1,
    "total": 99.5,
    "currency": "EUR"
  },
  {
    "id": 2,
    "total": 149,
    "currency": "USD"
  }
]
```

## Notes

- The input must strictly conform to the W3C JSON-XML format. Unknown element names or missing `key` attributes on `<map>` children will cause a dynamic error.
- `xml-to-json()` does not accept arbitrary XML. For serializing arbitrary XML to a string, use `serialize()`.
- Use the `"indent"` option for human-readable debugging output; omit it for compact JSON in production.
- Number formatting follows XDM rules; trailing zeros after the decimal point may be suppressed.

## See also

- [json-to-xml()](../xpath-json-to-xml)
- [serialize()](../xpath-serialize)
