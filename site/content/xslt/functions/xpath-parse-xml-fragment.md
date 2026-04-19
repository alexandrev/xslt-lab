---
title: "parse-xml-fragment()"
description: "Parses a well-balanced XML fragment string and returns it as a document node, allowing multiple top-level nodes."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "parse-xml-fragment(string)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`parse-xml-fragment()` parses a string that may contain **zero or more** XML nodes at the top level — in contrast to `parse-xml()`, which requires exactly one root element. The result is a document node whose children are the parsed nodes.

The input must be **well-balanced**: every start tag must have a matching end tag, but a single root element is not required. The string may contain elements, text nodes, comments, and processing instructions at the top level.

This function is part of XPath 3.0 but is supported by Saxon 9.x and later with XSLT 2.0 stylesheets.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string? | Yes | A string containing a well-balanced XML fragment. |

## Return value

`document-node()` — a document node containing the parsed content as children, or the empty sequence if the argument is the empty sequence.

## Examples

### Parse an inline HTML fragment

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<content>
  <fragment><![CDATA[<p>Hello <strong>world</strong></p><p>Second paragraph</p>]]></fragment>
</content>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/content">
    <result>
      <xsl:variable name="frag" select="parse-xml-fragment(fragment)"/>
      <paragraph-count><xsl:value-of select="count($frag/p)"/></paragraph-count>
      <xsl:copy-of select="$frag/p"/>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <paragraph-count>2</paragraph-count>
  <p>Hello <strong>world</strong></p>
  <p>Second paragraph</p>
</result>
```

### Merge stored XML fragments

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/segments">
    <merged>
      <xsl:for-each select="segment">
        <xsl:copy-of select="parse-xml-fragment(.)/*"/>
      </xsl:for-each>
    </merged>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- Unlike `parse-xml()`, the input does not need a single root element, making it suitable for HTML body fragments or partial XML documents stored in database fields.
- The resulting document node has no document URI.
- If the string is not well-balanced (unmatched tags), the function raises a dynamic error.
- Available in Saxon 9.x+ with `version="2.0"` stylesheets; formally part of XPath 3.0.

## See also

- [parse-xml()](../xpath-parse-xml)
- [document-uri()](../xpath-document-uri)
