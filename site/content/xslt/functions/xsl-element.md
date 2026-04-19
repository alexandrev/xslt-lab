---
title: "xsl:element"
description: "Creates an element node in the result tree with a name computed at runtime from an XPath expression."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:element name="name" namespace="uri" use-attribute-sets="names">'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:element` generates an element in the output whose tag name is determined at transformation time, not written literally in the stylesheet. The `name` attribute is an attribute value template (curly-brace expressions are evaluated and substituted), so it can incorporate source-document data, variable values, or any XPath expression.

When you know the element name in advance, you simply write the literal element directly in the stylesheet — for example `<result>...</result>`. `xsl:element` is only necessary when the element name must be computed dynamically.

The content of `xsl:element` is a template body: any XSLT instructions and literal result elements placed inside become the children and attributes of the generated element. Attributes must be added before any child elements; the typical pattern is to emit `xsl:attribute` children first, then content.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | AVT (QName) | Yes | Name of the element to create. Evaluated as an attribute value template. |
| `namespace` | AVT (URI) | No | Namespace URI for the created element. Overrides any prefix in `name`. |
| `use-attribute-sets` | whitespace-separated QNames | No | Attribute sets to expand onto the element. |

## Examples

### Element name from source data

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<fields>
  <field name="username" value="alice"/>
  <field name="email" value="alice@example.com"/>
  <field name="role" value="admin"/>
</fields>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/fields">
    <user>
      <xsl:apply-templates select="field"/>
    </user>
  </xsl:template>

  <xsl:template match="field">
    <xsl:element name="{@name}">
      <xsl:value-of select="@value"/>
    </xsl:element>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<user>
  <username>alice</username>
  <email>alice@example.com</email>
  <role>admin</role>
</user>
```

### Computing element name from a variable

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<items>
  <item type="product">Widget</item>
  <item type="service">Support</item>
</items>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/items">
    <catalog>
      <xsl:apply-templates select="item"/>
    </catalog>
  </xsl:template>

  <xsl:template match="item">
    <xsl:variable name="tag" select="@type"/>
    <xsl:element name="{$tag}">
      <xsl:attribute name="label"><xsl:value-of select="."/></xsl:attribute>
    </xsl:element>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<catalog>
  <product label="Widget"/>
  <service label="Support"/>
</catalog>
```

## Notes

- If the computed name is not a valid XML QName, most processors raise an error. Validate source data or use `xsl:choose` to guard against invalid names.
- `xsl:attribute` children of `xsl:element` must appear before any non-attribute content (text, child elements). Placing them after content is an error.
- The `namespace` attribute overrides the namespace implied by any prefix in the `name` value. If `name` has a prefix but no `namespace` is provided, the prefix must be bound in the stylesheet's in-scope namespaces.
- In XSLT 2.0+, `xsl:element` also accepts an `inherit-namespaces` attribute to control whether namespace nodes are inherited by child elements.

## See also

- [xsl:attribute](../xsl-attribute)
- [xsl:attribute-set](../xsl-attribute-set)
- [xsl:copy](../xsl-copy)
