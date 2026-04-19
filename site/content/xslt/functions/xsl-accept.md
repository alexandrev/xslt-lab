---
title: "xsl:accept"
description: "Inside xsl:use-package, accepts specific components from the used package and optionally restricts their visibility."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:accept component=\"function|template|variable\" match=\"name-pattern\" visibility=\"public|private|final|hidden\"/>"
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:accept` appears as a child of `xsl:use-package` and controls which components from the used package are imported into the current package or stylesheet, and with what visibility. It mirrors `xsl:expose` from the producer side: where `xsl:expose` declares what a package offers, `xsl:accept` declares what a consumer is willing to receive.

You can use `xsl:accept` to hide components that the used package exposes publicly—for example, to prevent an internal utility function from accidentally leaking into downstream consumers. You can also use it to document intent, making it explicit which components the current stylesheet depends on. Components accepted with `visibility="hidden"` become completely invisible outside the current package.

When `xsl:use-package` has no `xsl:accept` children, all public and final components of the used package are automatically available. As soon as one `xsl:accept` is present, only the matched and accepted components are available; others are treated as if not imported.

## Parameters

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `component` | token | Yes | Type of component: `function`, `template`, `variable`, `attribute-set`, `type`, or `mode`. |
| `match` | pattern | Yes | A name pattern selecting which components of the given type to accept. |
| `visibility` | token | Yes | The visibility to assign in this consuming context: `public`, `final`, `private`, or `hidden`. |

## Return value

`xsl:accept` is a declaration; it produces no XDM value.

## Examples

### Accepting only specific functions from a utility package

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:str="com.example.strings">

  <xsl:use-package name="com.example.strings" package-version="2.*">
    <!-- Accept only the title-case function; hide all others -->
    <xsl:accept component="function" match="str:title-case#1" visibility="private"/>
  </xsl:use-package>

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/document">
    <output>
      <xsl:for-each select="heading">
        <heading><xsl:value-of select="str:title-case(.)"/></heading>
      </xsl:for-each>
    </output>
  </xsl:template>
</xsl:stylesheet>
```

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
  <heading>introduction to xslt</heading>
  <heading>advanced techniques</heading>
</document>
```

**Output:**
```xml
<output>
  <heading>Introduction To Xslt</heading>
  <heading>Advanced Techniques</heading>
</output>
```

### Hiding internal components while re-exporting selected ones

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:package
  name="com.example.mylib"
  package-version="1.0"
  version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:util="com.example.util">

  <xsl:use-package name="com.example.util" package-version="*">
    <!-- Re-export format-date as public in mylib -->
    <xsl:accept component="function" match="util:format-date#2" visibility="public"/>
    <!-- Keep everything else hidden from mylib's consumers -->
    <xsl:accept component="function" match="util:*" visibility="hidden"/>
  </xsl:use-package>

  <xsl:expose component="function" match="util:format-date#2" visibility="public"/>

</xsl:package>
```

## Notes

- `xsl:accept` can only reduce visibility, not increase it. A component marked `final` by its package cannot be accepted as `public` (overridable).
- When multiple `xsl:accept` declarations match the same component, the most specific match wins, with more specific names taking priority over wildcards.
- If a used package contains `abstract` components that are not overridden via `xsl:override`, a static error is raised even if the abstract component is hidden with `xsl:accept`.
- Omitting `xsl:accept` entirely is equivalent to accepting all public and final components with their original visibility unchanged.

## See also

- [xsl:use-package](../xsl-use-package)
- [xsl:expose](../xsl-expose)
- [xsl:override](../xsl-override)
