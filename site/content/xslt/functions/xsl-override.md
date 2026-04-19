---
title: "xsl:override"
description: "Inside xsl:use-package, provides local implementations that replace specific components imported from the used package."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:override>"
tags: ["xslt", "reference", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiCiAgeG1sbnM6cHJpY2luZz0iY29tLmV4YW1wbGUucHJpY2luZyI-CgogIDx4c2w6dXNlLXBhY2thZ2UgbmFtZT0iY29tLmV4YW1wbGUucHJpY2luZyIgcGFja2FnZS12ZXJzaW9uPSIxLioiPgogICAgPHhzbDpvdmVycmlkZT4KICAgICAgPCEtLSBSZXBsYWNlIHRoZSBkaXNjb3VudCBmdW5jdGlvbiB3aXRoIGEgZG91YmxlZC1kaXNjb3VudCB2ZXJzaW9uIC0tPgogICAgICA8eHNsOmZ1bmN0aW9uIG5hbWU9InByaWNpbmc6YXBwbHktZGlzY291bnQiIGFzPSJ4czpkZWNpbWFsIj4KICAgICAgICA8eHNsOnBhcmFtIG5hbWU9InByaWNlIiAgICBhcz0ieHM6ZGVjaW1hbCIvPgogICAgICAgIDx4c2w6cGFyYW0gbmFtZT0iZGlzY291bnQiIGFzPSJ4czpkZWNpbWFsIi8-CiAgICAgICAgPCEtLSBDYWxsIHRoZSBvcmlnaW5hbCB3aXRoIGRvdWJsZSB0aGUgZGlzY291bnQsIGNhcHBlZCBhdCA1MCUgLS0-CiAgICAgICAgPHhzbDpzZXF1ZW5jZSBzZWxlY3Q9InhzbDpvcmlnaW5hbCgkcHJpY2UsIG1pbigoJGRpc2NvdW50ICogMiwgMC41KSkpIi8-CiAgICAgIDwveHNsOmZ1bmN0aW9uPgogICAgPC94c2w6b3ZlcnJpZGU-CiAgPC94c2w6dXNlLXBhY2thZ2U-CgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvY2F0YWxvZyI-CiAgICA8c2FsZT4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9Iml0ZW0iPgogICAgICAgIDxpdGVtIG5hbWU9IntAbmFtZX0iPgogICAgICAgICAgPHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImZvcm1hdC1udW1iZXIocHJpY2luZzphcHBseS1kaXNjb3VudChAcHJpY2UsIDAuMSksICcwLjAwJykiLz4KICAgICAgICA8L2l0ZW0-CiAgICAgIDwveHNsOmZvci1lYWNoPgogICAgPC9zYWxlPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNhdGFsb2c-CiAgPGl0ZW0gbmFtZT0iV2lkZ2V0IiBwcmljZT0iMTAwIi8-CiAgPGl0ZW0gbmFtZT0iR2FkZ2V0IiBwcmljZT0iMjAwIi8-CjwvY2F0YWxvZz4&version=3.0"
---

## Description

`xsl:override` is a child element of `xsl:use-package` that contains one or more locally-defined component declarations—templates, functions, variables, or attribute sets—that replace components of the same name imported from the used package. It is the mechanism for customising or extending a package without modifying the package source.

A component in the used package can be overridden only if its visibility is `public` or `abstract` (not `final` or `private`). When an override is provided for an `abstract` component, the local definition satisfies the package's requirement for an implementation. When an override is provided for a `public` component, the local definition takes precedence over the package's version.

Within the overriding implementation, the original package component can be called using `xsl:original`, which refers to the superseded version, enabling a decorator pattern where local code augments rather than entirely replaces the original.

## Parameters

`xsl:override` takes no attributes. Its content is one or more component declarations (e.g., `xsl:template`, `xsl:function`, `xsl:variable`) whose names match components exposed as `public` or `abstract` by the used package.

## Return value

`xsl:override` is a declaration; it produces no XDM value.

## Examples

### Overriding a public function to change its behaviour

Assume package `com.example.pricing` exposes a public function `pricing:apply-discount#2`.

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:pricing="com.example.pricing">

  <xsl:use-package name="com.example.pricing" package-version="1.*">
    <xsl:override>
      <!-- Replace the discount function with a doubled-discount version -->
      <xsl:function name="pricing:apply-discount" as="xs:decimal">
        <xsl:param name="price"    as="xs:decimal"/>
        <xsl:param name="discount" as="xs:decimal"/>
        <!-- Call the original with double the discount, capped at 50% -->
        <xsl:sequence select="xsl:original($price, min(($discount * 2, 0.5)))"/>
      </xsl:function>
    </xsl:override>
  </xsl:use-package>

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
    <sale>
      <xsl:for-each select="item">
        <item name="{@name}">
          <xsl:value-of select="format-number(pricing:apply-discount(@price, 0.1), '0.00')"/>
        </item>
      </xsl:for-each>
    </sale>
  </xsl:template>
</xsl:stylesheet>
```

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <item name="Widget" price="100"/>
  <item name="Gadget" price="200"/>
</catalog>
```

**Output (original function applies 10% discount; override applies 20%):**
```xml
<sale>
  <item name="Widget">80.00</item>
  <item name="Gadget">160.00</item>
</sale>
```

### Implementing an abstract template required by a layout package

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:use-package name="com.example.layout" package-version="1.0">
    <xsl:override>
      <!-- Satisfy the abstract render-header contract -->
      <xsl:template name="render-header">
        <header>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
          </nav>
        </header>
      </xsl:template>
    </xsl:override>
  </xsl:use-package>

  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/">
    <xsl:call-template name="render-page"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```html
<html>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <body/>
</html>
```

## Notes

- Only components with `public` or `abstract` visibility in the used package may appear inside `xsl:override`. Attempting to override a `final` or `private` component is a static error.
- `xsl:original` is a pseudo-instruction available inside an overriding component that delegates to the original package implementation. It uses the same calling syntax as the normal call (e.g., `xsl:original` as a function call for functions, or `<xsl:call-template name="xsl:original"/>` for templates).
- Overrides in `xsl:override` are not subject to import precedence; they unconditionally replace the package component.
- A single `xsl:use-package` may contain at most one `xsl:override` element, but that element may contain multiple component declarations.

## See also

- [xsl:use-package](../xsl-use-package)
- [xsl:accept](../xsl-accept)
