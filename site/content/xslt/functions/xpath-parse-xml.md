---
title: "parse-xml()"
description: "Parses a well-formed XML string and returns it as a new document node, usable like any other loaded XML document."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "parse-xml(string)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`parse-xml()` takes a string containing a well-formed XML document and returns a new **document node**. The resulting tree can be navigated with XPath expressions just like a document loaded with `doc()` or `document()`.

If the string is not a well-formed XML document, the function raises a dynamic error. For XML fragments (content without a single root element), use `parse-xml-fragment()` instead.

`parse-xml()` is defined in XPath 3.0 but is widely supported in Saxon 9.x and later with XSLT 2.0 stylesheets.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string? | Yes | A string containing a complete, well-formed XML document. |

## Return value

`document-node()` — a new document node whose children are the parsed content, or the empty sequence if the argument is the empty sequence.

## Examples

### Parse XML stored in an element

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<payload>
  <data><![CDATA[<?xml version="1.0"?><items><item id="1">Alpha</item><item id="2">Beta</item></items>]]></data>
</payload>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/payload">
    <xsl:variable name="inner" select="parse-xml(data)"/>
    <extracted>
      <xsl:copy-of select="$inner/items/item"/>
    </extracted>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<extracted>
  <item id="1">Alpha</item>
  <item id="2">Beta</item>
</extracted>
```

### Count elements in a dynamically built XML string

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:variable name="xml-string">&lt;root&gt;&lt;a/&gt;&lt;b/&gt;&lt;c/&gt;&lt;/root&gt;</xsl:variable>
    <xsl:variable name="doc" select="parse-xml($xml-string)"/>
    <xsl:value-of select="count($doc/root/*)"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
3
```

## Notes

- `parse-xml()` requires the input to be a complete, well-formed document with a single root element. Use `parse-xml-fragment()` for fragments.
- The resulting document node has no document URI (`document-uri()` returns the empty sequence).
- Available in Saxon 9.x+ when using `version="2.0"` stylesheets; it is formally part of XPath 3.0.

## See also

- [parse-xml-fragment()](../xpath-parse-xml-fragment)
- [document-uri()](../xpath-document-uri)
