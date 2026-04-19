---
title: "xsl:expose"
description: "Controls the visibility of components in an xsl:package, determining which are accessible to consuming packages."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:expose component=\"function|template|variable|attribute-set|type|mode\" match=\"*\" visibility=\"public|private|final|abstract\"/>"
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:expose` is a top-level child of `xsl:package` that sets the visibility of one or more components. Without an `xsl:expose` declaration, all components in a package default to `private` visibility, meaning they are invisible to consuming stylesheets or packages.

The `component` attribute selects the type of component being configured, and the `match` attribute is a name pattern (supporting wildcards) that selects which components of that type are affected. The `visibility` attribute determines how the selected components may be used by packages that include this one via `xsl:use-package`.

The four visibility levels are:

- **`public`** — accessible to consuming packages and may be overridden with `xsl:override`.
- **`final`** — accessible but may not be overridden; the implementation is fixed.
- **`private`** — hidden from consuming packages entirely.
- **`abstract`** — declares the component's signature but provides no implementation; consuming packages must supply one via `xsl:override`.

## Parameters

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `component` | token | Yes | Type of component: `function`, `template`, `variable`, `attribute-set`, `type`, or `mode`. |
| `match` | pattern | Yes | A name pattern selecting which components are affected. `*` matches all. |
| `visibility` | token | Yes | One of `public`, `private`, `final`, or `abstract`. |

## Return value

`xsl:expose` is a declaration; it produces no XDM value.

## Examples

### Exposing public functions and keeping helpers private

**Package file:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:package
  name="com.example.strings"
  package-version="2.0"
  version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:str="com.example.strings">

  <!-- All functions public by default for this package -->
  <xsl:expose component="function" match="str:*" visibility="public"/>
  <!-- But the internal helper is final (visible but not overridable) -->
  <xsl:expose component="function" match="str:internal-*" visibility="final"/>

  <xsl:function name="str:title-case" as="xs:string">
    <xsl:param name="s" as="xs:string"/>
    <xsl:sequence select="str:internal-capitalize(lower-case($s))"/>
  </xsl:function>

  <xsl:function name="str:internal-capitalize" as="xs:string">
    <xsl:param name="s" as="xs:string"/>
    <xsl:sequence select="concat(upper-case(substring($s,1,1)), substring($s,2))"/>
  </xsl:function>

</xsl:package>
```

### Using abstract visibility to define a required contract

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:package
  name="com.example.layout"
  package-version="1.0"
  version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <!-- render-header must be provided by each consuming package -->
  <xsl:expose component="template" match="xsl:template[@name='render-header']"
              visibility="abstract"/>

  <!-- render-page is public and calls the abstract render-header -->
  <xsl:expose component="template" match="xsl:template[@name='render-page']"
              visibility="public"/>

  <xsl:template name="render-header">
    <!-- Abstract: intentionally no default body -->
  </xsl:template>

  <xsl:template name="render-page">
    <html>
      <xsl:call-template name="render-header"/>
      <body><xsl:apply-templates/></body>
    </html>
  </xsl:template>

</xsl:package>
```

**Consuming stylesheet providing the required implementation:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:use-package name="com.example.layout" package-version="1.0">
    <xsl:override>
      <xsl:template name="render-header">
        <head><title>My Page</title></head>
      </xsl:template>
    </xsl:override>
  </xsl:use-package>

  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/">
    <xsl:call-template name="render-page"/>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- Multiple `xsl:expose` declarations may appear in the same package. If a component matches more than one declaration, the most specific match (by name) takes precedence; the order of declaration is not significant.
- The `match` attribute uses the same name-pattern syntax as `xsl:apply-templates/@mode` patterns. The wildcard `*` matches any expanded QName.
- Abstract components must be overridden by every stylesheet that uses the package; failure to do so is a static error.
- A `final` component may be accepted by a consuming package with `xsl:accept` using a less permissive visibility, but it cannot be overridden.

## See also

- [xsl:package](../xsl-package)
- [xsl:accept](../xsl-accept)
