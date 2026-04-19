---
title: "xsl:attribute"
description: "Creates an attribute on the nearest ancestor result element, with a name and value computed at transformation time."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:attribute name="name" namespace="uri">'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:attribute` adds an attribute to the result element currently being constructed. Its `name` is an attribute value template, so the attribute name can be computed from source data or variables. The attribute value is provided by the content of the `xsl:attribute` element, which may include `xsl:value-of`, `xsl:text`, and any other value-producing instructions.

The common use case is adding attributes whose names or values depend on the source document. For attributes whose names and values are both static, you write them directly on literal result elements in the stylesheet (e.g., `<img class="thumb"/>`) which is more concise.

`xsl:attribute` must be placed before any child elements or text nodes of the target element. Once character data or child elements have been written to the output element, adding attributes raises an error.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | AVT (QName) | Yes | Attribute name, evaluated as an attribute value template. |
| `namespace` | AVT (URI) | No | Namespace URI for the attribute. Overrides any prefix in `name`. |

## Examples

### Dynamic attribute name and value

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings>
  <setting key="lang" value="en"/>
  <setting key="theme" value="dark"/>
</settings>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/settings">
    <config>
      <xsl:for-each select="setting">
        <xsl:attribute name="{@key}">
          <xsl:value-of select="@value"/>
        </xsl:attribute>
      </xsl:for-each>
    </config>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<config lang="en" theme="dark"/>
```

### Conditional attribute

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<links>
  <link href="https://example.com" external="yes">Example</link>
  <link href="/about">About</link>
</links>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/links">
    <nav>
      <xsl:apply-templates select="link"/>
    </nav>
  </xsl:template>

  <xsl:template match="link">
    <a href="{@href}">
      <xsl:if test="@external = 'yes'">
        <xsl:attribute name="target">_blank</xsl:attribute>
        <xsl:attribute name="rel">noopener noreferrer</xsl:attribute>
      </xsl:if>
      <xsl:value-of select="."/>
    </a>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<nav>
  <a href="https://example.com" target="_blank" rel="noopener noreferrer">Example</a>
  <a href="/about">About</a>
</nav>
```

## Notes

- An `xsl:attribute` that follows child element output on the same parent raises a fatal error. Always emit attributes before any child element or text content.
- If two `xsl:attribute` instructions in the same template write to the same attribute name, the last one wins — the earlier value is silently replaced.
- To add the same set of attributes to multiple elements, define an `xsl:attribute-set` and reference it with `use-attribute-sets`.
- The attribute value template shorthand (`name="{expression}"`) on literal result elements is equivalent to `xsl:attribute` with `select` for simple cases and is preferred for readability.

## See also

- [xsl:attribute-set](../xsl-attribute-set)
- [xsl:element](../xsl-element)
- [xsl:copy](../xsl-copy)
