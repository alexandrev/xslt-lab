---
title: "xsl:output"
description: "Controls how the result tree is serialised — output method, encoding, indentation, DOCTYPE, and other serialisation options."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:output method="xml|html|text" indent="yes|no" encoding="UTF-8"/>'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:output` is a top-level declaration that controls the serialisation of the result tree — how the abstract tree of nodes is converted to a stream of characters or bytes. It does not affect what nodes are in the result tree; it only affects how those nodes are written to the output.

The three standard output methods are:

- **`xml`** — Serialises as an XML document. Special characters are escaped, an XML declaration may be added, and the result is always well-formed XML.
- **`html`** — Serialises following HTML conventions: void elements like `<br>` are written without a closing tag, boolean attributes are written without values, and the `DOCTYPE` is added if specified.
- **`text`** — Serialises only the string values of text nodes; all markup is omitted.

Multiple `xsl:output` declarations in the same stylesheet are allowed and their attributes are merged. When the same attribute appears in multiple declarations, the one with the highest import precedence wins; within the same precedence level, the last declaration wins.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `method` | `xml` / `html` / `text` / QName | No | Serialisation method. Default is `xml` unless the root element is `html`. |
| `version` | NMTOKEN | No | Version of the output format (e.g., `"4.0"` for HTML). |
| `encoding` | encoding name | No | Character encoding (e.g., `"UTF-8"`, `"ISO-8859-1"`). |
| `omit-xml-declaration` | `yes` / `no` | No | Whether to suppress the `<?xml ...?>` declaration. |
| `standalone` | `yes` / `no` | No | Value of the `standalone` attribute in the XML declaration. |
| `doctype-public` | string | No | Public identifier for the `DOCTYPE` declaration. |
| `doctype-system` | string | No | System identifier for the `DOCTYPE` declaration. |
| `cdata-section-elements` | whitespace-separated QNames | No | Elements whose text content should be serialised as CDATA sections. |
| `indent` | `yes` / `no` | No | Whether to add whitespace indentation. |
| `media-type` | MIME type | No | Media type of the output. |

## Examples

### XML output with indentation

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data><item>A</item><item>B</item></data>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes" encoding="UTF-8"/>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <item>A</item>
  <item>B</item>
</data>
```

### HTML output with DOCTYPE

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<page><title>Hello</title><body>World</body></page>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes" encoding="UTF-8"
    doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN"
    doctype-system="http://www.w3.org/TR/html4/loose.dtd"/>

  <xsl:template match="/page">
    <html>
      <head><title><xsl:value-of select="title"/></title></head>
      <body><p><xsl:value-of select="body"/></p></body>
    </html>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head><title>Hello</title></head>
<body><p>World</p></body>
</html>
```

## Notes

- `xsl:output` is advisory: a processor is not required to serialise the result at all (it may hand the result tree to a further processing step). When serialisation does occur, the processor should honour the settings.
- `indent="yes"` may add whitespace-only text nodes to the output. This can cause problems if the consuming application is whitespace-sensitive; use it only for human-readable output.
- `cdata-section-elements` is useful for elements containing JavaScript or CSS in HTML, where `<`, `>`, and `&` should not be escaped.
- In XSLT 2.0+, `xsl:output` gains additional attributes including `use-character-maps`, `normalization-form`, `undeclare-prefixes`, and `html-version`.

## See also

- [xsl:stylesheet](../xsl-stylesheet)
- [xsl:text](../xsl-text)
