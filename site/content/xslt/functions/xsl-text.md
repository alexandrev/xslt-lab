---
title: "xsl:text"
description: "Outputs literal text exactly as written, preserving all whitespace and optionally bypassing XML character escaping."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:text disable-output-escaping="no">'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:text` inserts its text content into the result tree as a text node, preserving every whitespace character — spaces, tabs, newlines — exactly as they appear in the stylesheet. This is in contrast to bare text in a template body, where whitespace-only text nodes adjacent to XSLT instructions may be stripped by the processor.

The primary purpose of `xsl:text` is to give precise control over whitespace in the output. It is also used to output special characters that would otherwise be awkward to write directly, such as newlines or tab characters, via XML character references (`&#10;`, `&#9;`).

The optional `disable-output-escaping` attribute, when set to `yes`, tells the serializer not to escape characters like `<` and `&`. This can produce output that is not well-formed XML (for example, a literal `<br>` in HTML output), so it should be used with care and only when the target format requires it.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `disable-output-escaping` | `yes` / `no` | No | If `yes`, characters are written literally without XML escaping. Default is `no`. |

## Examples

### Controlling separators in text output

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<csv>
  <row><col>Name</col><col>Age</col><col>City</col></row>
  <row><col>Alice</col><col>30</col><col>Paris</col></row>
</csv>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/csv">
    <xsl:for-each select="row">
      <xsl:for-each select="col">
        <xsl:if test="position() > 1"><xsl:text>,</xsl:text></xsl:if>
        <xsl:value-of select="."/>
      </xsl:for-each>
      <xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
Name,Age,City
Alice,30,Paris
```

### Preserving whitespace in XML output

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<doc><line>Hello</line><line>World</line></doc>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="no"/>

  <xsl:template match="/doc">
    <pre>
      <xsl:for-each select="line">
        <xsl:value-of select="."/>
        <xsl:text>&#10;</xsl:text>
      </xsl:for-each>
    </pre>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<pre>Hello
World
</pre>
```

## Notes

- `xsl:text` may only contain text — no child elements, not even XSLT instructions. Attribute value templates (`{...}`) are not available inside `xsl:text`; use `xsl:value-of` for dynamic values.
- Whitespace-only text nodes elsewhere in a template body (between XSLT elements) are often stripped; wrapping them in `xsl:text` guarantees they are preserved.
- `disable-output-escaping="yes"` is considered a low-level escape hatch and is not supported in all output modes or serializers. Avoid it unless absolutely necessary.
- For producing newlines in text output, `&#10;` (LF) is the most portable choice. Use `&#13;&#10;` for CRLF when targeting Windows line endings.

## See also

- [xsl:value-of](../xsl-value-of)
- [xsl:output](../xsl-output)
