---
title: "normalize-space()"
description: "Strips leading and trailing whitespace from a string and collapses all internal whitespace sequences to a single space character."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "string function"
syntax: "normalize-space(string?)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`normalize-space()` performs three whitespace normalisation steps on its string argument:

1. Strips all leading whitespace (spaces, tabs, newlines, carriage returns).
2. Strips all trailing whitespace.
3. Replaces each internal sequence of one or more whitespace characters with a single space (`U+0020`).

When called without an argument, it normalises the string value of the context node.

This function is indispensable when working with XML data that may contain arbitrary indentation or line breaks in element content — for example, multi-line address fields, code-generated XML, or content extracted from mixed-content elements.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string | No | The string to normalise. Defaults to the context node's string value. |

## Return value

`xs:string` — the normalised string with collapsed whitespace.

## Examples

### Clean up user-entered text

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<contacts>
  <name>  Alice    Smith  </name>
  <name>Bob
    Jones</name>
</contacts>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/contacts">
    <clean>
      <xsl:for-each select="name">
        <name><xsl:value-of select="normalize-space(.)"/></name>
      </xsl:for-each>
    </clean>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<clean>
  <name>Alice Smith</name>
  <name>Bob Jones</name>
</clean>
```

### Use in a predicate to filter blank elements

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<lines>
  <line>First line</line>
  <line>   </line>
  <line>Third line</line>
  <line></line>
</lines>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/lines">
    <non-empty>
      <xsl:for-each select="line[normalize-space(.) != '']">
        <line><xsl:value-of select="normalize-space(.)"/></line>
      </xsl:for-each>
    </non-empty>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<non-empty>
  <line>First line</line>
  <line>Third line</line>
</non-empty>
```

## Notes

- `normalize-space('')` returns the empty string `""`.
- The characters considered whitespace are: space (`U+0020`), tab (`U+0009`), carriage return (`U+000D`), and line feed (`U+000A`) — the same set as the XML `S` production.
- `normalize-space()` does not affect non-whitespace characters; it only collapses runs of whitespace, including mixed sequences of tabs and newlines.
- It is often used inside predicates: `element[normalize-space() != '']` selects only elements with non-blank text content.
- In XSLT 2.0+, the function is unchanged. For more advanced whitespace handling (such as preserving significant spaces), use `xml:space="preserve"` or the XSLT `normalize-unicode()` function.

## See also

- [string()](../xpath-string)
- [string-length()](../xpath-string-length)
- [translate()](../xpath-translate)
