---
title: "json-to-xml()"
description: "Converts a JSON string to its W3C standard XML representation, producing an element tree navigable with XPath."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "JSON function"
syntax: "json-to-xml(string, options?)"
tags: ["xslt", "reference", "xslt3", "xpath"]
---

## Description

`json-to-xml()` parses a JSON string and converts it into an XML element tree following the W3C XSLT 3.0 specification for the JSON-to-XML mapping. Every JSON construct is represented as an element in the `http://www.w3.org/2005/xpath-functions` namespace: objects become `<map>` elements, arrays become `<array>` elements, strings become `<string>`, numbers become `<number>`, booleans become `<boolean>`, and null becomes `<null>`. Object keys are stored in a `key` attribute.

The result is a proper XML node tree, so it can be queried with standard XPath axis steps, processed with `xsl:apply-templates`, or further transformed. To go the other way (XML back to JSON text), use `xml-to-json()`. To obtain an XDM map/array instead of an XML tree, use `parse-json()`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | `xs:string?` | Yes | The JSON string to convert. Returns empty sequence if empty. |
| `options` | `map(xs:string, item()*)` | No | A map of options; `"liberal"` (boolean) relaxes strict JSON parsing. |

## Return value

`document-node()?` — a document node whose root element is a `<map>`, `<array>`, or scalar element in the `http://www.w3.org/2005/xpath-functions` namespace, or empty sequence if the input is empty.

## Examples

### Converting a JSON object to XML and reading properties

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

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="json"
      select="'{&quot;name&quot;:&quot;Alice&quot;,&quot;age&quot;:30,&quot;active&quot;:true}'"/>
    <xsl:variable name="xml" select="json-to-xml($json)"/>
    <person>
      <name><xsl:value-of select="$xml//fn:string[@key='name']"/></name>
      <age><xsl:value-of select="$xml//fn:number[@key='age']"/></age>
      <active><xsl:value-of select="$xml//fn:boolean[@key='active']"/></active>
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

### Converting a JSON array and applying templates to each member

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report/>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:fn="http://www.w3.org/2005/xpath-functions">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="json" select="unparsed-text('cities.json')"/>
    <xsl:variable name="xml" select="json-to-xml($json)"/>
    <cities>
      <xsl:apply-templates select="$xml/fn:array/fn:map"/>
    </cities>
  </xsl:template>

  <xsl:template match="fn:map">
    <city name="{fn:string[@key='city']}">
      <population><xsl:value-of select="fn:number[@key='pop']"/></population>
    </city>
  </xsl:template>
</xsl:stylesheet>
```

Assuming `cities.json` contains `[{"city":"Paris","pop":2161000},{"city":"Lyon","pop":516092}]`:

**Output:**
```xml
<cities>
  <city name="Paris">
    <population>2161000</population>
  </city>
  <city name="Lyon">
    <population>516092</population>
  </city>
</cities>
```

## Notes

- The namespace URI for generated elements is `http://www.w3.org/2005/xpath-functions`. Bind it to a prefix (commonly `fn`) in your stylesheet to use axis steps efficiently.
- Object keys that are not valid XML `NCName` values are still stored verbatim in the `key` attribute; use `@key = 'the-key'` to match them.
- For deeply nested or large JSON structures, `xsl:apply-templates` with mode-based pattern matching is more maintainable than long `//` descendant paths.
- If you only need value access by key and not full axis navigation, `parse-json()` returning XDM maps and arrays is simpler.

## See also

- [xml-to-json()](../xpath-xml-to-json)
- [parse-json()](../xpath-parse-json)
- [json-doc()](../xpath-json-doc)
