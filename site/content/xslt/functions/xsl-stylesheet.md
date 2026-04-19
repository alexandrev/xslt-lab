---
title: "xsl:stylesheet"
description: "Root element of every XSLT stylesheet, declaring the version, namespace, and top-level declarations for the transformation."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:stylesheet` is the mandatory root element of an XSLT stylesheet document. It binds the XSLT namespace, declares the language version, and acts as the container for all top-level declarations such as templates, variables, parameters, keys, and output settings.

The `version` attribute is required and tells the processor which version of the XSLT specification governs this stylesheet. Setting it to `"1.0"` requests strict XSLT 1.0 processing; a conforming XSLT 2.0 or 3.0 processor will then run in backwards-compatibility mode.

The namespace declaration `xmlns:xsl="http://www.w3.org/1999/XSL/Transform"` must appear on this element (or be inherited by it) because every XSLT instruction element must be in that namespace. You may also declare additional namespaces here — for extension functions, output namespace prefixes, or the document's own vocabulary.

`xsl:stylesheet` and `xsl:transform` are fully interchangeable synonyms; by convention most stylesheets use `xsl:stylesheet`.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `version` | `"1.0"` / `"2.0"` / `"3.0"` | Yes | XSLT version governing this stylesheet. |
| `id` | ID | No | Unique identifier for the element. |
| `extension-element-prefixes` | whitespace-separated prefixes | No | Namespace prefixes to treat as extension element prefixes rather than literal result elements. |
| `exclude-result-prefixes` | whitespace-separated prefixes | No | Namespace prefixes that should not be copied into the result tree. |
| `xpath-default-namespace` | URI | No | (2.0+) Default namespace for unprefixed XPath steps. |
| `default-collation` | URI | No | (2.0+) Default collation for string comparisons. |
| `input-type-annotations` | `strip` / `preserve` / `unspecified` | No | (2.0+) Whether schema type annotations on input nodes are retained. |

## Examples

### Minimal XSLT 1.0 stylesheet

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<greeting>Hello, World!</greeting>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/greeting">
    <xsl:value-of select="."/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
Hello, World!
```

### Stylesheet with excluded namespace prefixes

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report><title>Q1</title><value>42</value></report>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:my="http://example.com/my"
  exclude-result-prefixes="my">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/report">
    <result>
      <xsl:value-of select="title"/>
      <xsl:text>: </xsl:text>
      <xsl:value-of select="value"/>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<result>Q1: 42</result>
```

## Notes

- Every XSLT document must have exactly one `xsl:stylesheet` (or `xsl:transform`) element as its document element.
- Top-level elements must appear in a defined order when import precedence matters: `xsl:import` elements must come first, before any other children.
- Extension element prefixes listed in `extension-element-prefixes` are not written to the output tree as namespace nodes; this keeps the output clean.
- When a stylesheet is embedded inside an XML source document (using the `<?xml-stylesheet?>` processing instruction), the stylesheet element still requires the `version` and namespace attributes.

## See also

- [xsl:transform](../xsl-transform)
- [xsl:template](../xsl-template)
- [xsl:output](../xsl-output)
- [xsl:import](../xsl-import)
- [xsl:include](../xsl-include)
