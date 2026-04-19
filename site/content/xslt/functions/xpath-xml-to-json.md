---
title: "xml-to-json()"
description: "Converts the W3C XML representation of JSON back to a JSON string, reversing json-to-xml()."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "JSON function"
syntax: "xml-to-json(node, options?)"
tags: ["xslt", "reference", "xslt3", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczpmbj0iaHR0cDovL3d3dy53My5vcmcvMjAwNS94cGF0aC1mdW5jdGlvbnMiPgoKICA8eHNsOm91dHB1dCBtZXRob2Q9InRleHQiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iLyI-CiAgICA8IS0tIFBhcnNlIEpTT04gdG8gWE1MIHRyZWUgLS0-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9Impzb24iIHNlbGVjdD0iJ3smcXVvdDtzdGF0dXMmcXVvdDs6JnF1b3Q7ZHJhZnQmcXVvdDssJnF1b3Q7Y291bnQmcXVvdDs6M30nIi8-CiAgICA8eHNsOnZhcmlhYmxlIG5hbWU9InhtbCIgc2VsZWN0PSJqc29uLXRvLXhtbCgkanNvbikiLz4KCiAgICA8IS0tIE1vZGlmeSB0aGUgWE1MIHRyZWU6IGNoYW5nZSBzdGF0dXMgdG8gcHVibGlzaGVkIC0tPgogICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJtb2RpZmllZCI-CiAgICAgIDx4c2w6YXBwbHktdGVtcGxhdGVzIHNlbGVjdD0iJHhtbCIgbW9kZT0idXBkYXRlIi8-CiAgICA8L3hzbDp2YXJpYWJsZT4KCiAgICA8IS0tIFNlcmlhbGl6ZSBiYWNrIHRvIEpTT04gLS0-CiAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0ieG1sLXRvLWpzb24oJG1vZGlmaWVkKSIvPgogIDwveHNsOnRlbXBsYXRlPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSJmbjpzdHJpbmdbQGtleT0nc3RhdHVzJ10iIG1vZGU9InVwZGF0ZSI-CiAgICA8Zm46c3RyaW5nIGtleT0ic3RhdHVzIj5wdWJsaXNoZWQ8L2ZuOnN0cmluZz4KICA8L3hzbDp0ZW1wbGF0ZT4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0ibm9kZSgpfEAqIiBtb2RlPSJ1cGRhdGUiPgogICAgPHhzbDpjb3B5PgogICAgICA8eHNsOmFwcGx5LXRlbXBsYXRlcyBzZWxlY3Q9Im5vZGUoKXxAKiIgbW9kZT0idXBkYXRlIi8-CiAgICA8L3hzbDpjb3B5PgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGRhdGEvPg&version=3.0"
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
