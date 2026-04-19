---
title: "xsl:attribute-set"
description: "Defines a named, reusable collection of attributes that can be applied to multiple elements via use-attribute-sets."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:attribute-set name="name" use-attribute-sets="names">'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:attribute-set` is a top-level declaration that groups a set of `xsl:attribute` children under a single name. Once defined, the set can be applied to any literal result element or `xsl:element` / `xsl:copy` instruction using the `use-attribute-sets` attribute, which expands all the attributes in the set onto that element.

Attribute sets promote consistency across a stylesheet. If the same combination of attributes — such as a standard HTML link appearance, a set of XML metadata attributes, or table cell formatting — is used in many places, defining it once in an attribute set avoids repetition and makes changes straightforward.

Attribute sets can compose: an `xsl:attribute-set` declaration may itself reference other attribute sets via `use-attribute-sets`. When both a set's attribute and a locally written attribute share the same name, the local attribute wins.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | QName | Yes | The name of the attribute set, referenced in `use-attribute-sets`. |
| `use-attribute-sets` | whitespace-separated QNames | No | Other attribute sets to include (inheritance / composition). |

## Examples

### Shared table cell attributes

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<table>
  <row><cell>Name</cell><cell>Value</cell></row>
  <row><cell>Alpha</cell><cell>1</cell></row>
</table>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:attribute-set name="cell-style">
    <xsl:attribute name="border">1</xsl:attribute>
    <xsl:attribute name="padding">4</xsl:attribute>
  </xsl:attribute-set>

  <xsl:template match="/table">
    <table>
      <xsl:apply-templates select="row"/>
    </table>
  </xsl:template>

  <xsl:template match="row">
    <tr>
      <xsl:apply-templates select="cell"/>
    </tr>
  </xsl:template>

  <xsl:template match="cell">
    <td use-attribute-sets="cell-style">
      <xsl:value-of select="."/>
    </td>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<table>
  <tr>
    <td border="1" padding="4">Name</td>
    <td border="1" padding="4">Value</td>
  </tr>
  <tr>
    <td border="1" padding="4">Alpha</td>
    <td border="1" padding="4">1</td>
  </tr>
</table>
```

### Composed attribute sets

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<doc><para>Text</para></doc>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:attribute-set name="base">
    <xsl:attribute name="class">block</xsl:attribute>
    <xsl:attribute name="lang">en</xsl:attribute>
  </xsl:attribute-set>

  <xsl:attribute-set name="paragraph" use-attribute-sets="base">
    <xsl:attribute name="class">paragraph</xsl:attribute>
  </xsl:attribute-set>

  <xsl:template match="/doc">
    <body>
      <xsl:apply-templates/>
    </body>
  </xsl:template>

  <xsl:template match="para">
    <xsl:element name="p" use-attribute-sets="paragraph">
      <xsl:value-of select="."/>
    </xsl:element>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<body>
  <p class="paragraph" lang="en">Text</p>
</body>
```

## Notes

- When two attribute sets define the same attribute name, the one listed later in `use-attribute-sets` takes precedence over earlier ones.
- A local `xsl:attribute` or inline attribute on the result element overrides any attribute set attribute with the same name.
- Circular attribute set references (set A including set B which includes set A) are an error.
- Attribute sets are only applicable to element nodes. They cannot be used with text, comment, or processing-instruction output instructions.

## See also

- [xsl:attribute](../xsl-attribute)
- [xsl:element](../xsl-element)
- [xsl:copy](../xsl-copy)
