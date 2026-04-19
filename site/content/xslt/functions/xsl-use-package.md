---
title: "xsl:use-package"
description: "Declares that the current stylesheet or package uses components from a named external XSLT 3.0 package."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:use-package name=\"com.example.pkg\" package-version=\"*\"/>"
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:use-package` appears as a top-level child of `xsl:stylesheet` or `xsl:package` and declares a dependency on an external XSLT 3.0 package. Once declared, the public and final components of the used package—templates, functions, variables, attribute sets, modes, and types—become available in the current stylesheet as if they were declared locally.

Unlike `xsl:import`, which merges stylesheets textually and uses import precedence to resolve conflicts, `xsl:use-package` is a formal dependency declaration with strict encapsulation. Only components explicitly marked `public` or `final` in the used package's `xsl:expose` declarations are accessible; private components remain hidden.

Two child elements extend the behaviour of `xsl:use-package`: `xsl:accept` narrows or hides specific public components in the current context, and `xsl:override` provides local replacements for components that the package declared as overridable (i.e., not `final`).

## Parameters

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `xs:anyURI` | Yes | The URI name of the package to use (must match the `name` attribute of the target `xsl:package`). |
| `package-version` | `xs:string` | Yes | A version pattern selecting which package versions are acceptable. Use `*` for any version. |

## Return value

`xsl:use-package` is a declaration; it does not produce an XDM value.

## Examples

### Basic usage of a utility package

**Stylesheet consuming a formatting package:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:fmt="com.example.formatting">

  <!-- Import a specific major version -->
  <xsl:use-package name="com.example.formatting" package-version="1.*"/>

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/invoice">
    <summary>
      <total><xsl:value-of select="fmt:currency(@amount, '$')"/></total>
    </summary>
  </xsl:template>
</xsl:stylesheet>
```

**Output (given `<invoice amount="1250.5"/>`):**
```xml
<summary>
  <total>$1,250.50</total>
</summary>
```

### Accepting a subset of components and overriding a template

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:use-package name="com.example.renderer.base" package-version="*">

    <!-- Only expose render-page; hide render-header from further consumers -->
    <xsl:accept component="template" match="xsl:template[@name='render-page']"
                visibility="public"/>
    <xsl:accept component="template" match="xsl:template[@name='render-header']"
                visibility="hidden"/>

    <!-- Override the abstract render-header with a local implementation -->
    <xsl:override>
      <xsl:template name="render-header">
        <header>
          <h1>My Site</h1>
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
<page>
  <header>
    <h1>My Site</h1>
  </header>
  <body/>
</page>
```

## Notes

- A stylesheet may have multiple `xsl:use-package` declarations, one per dependency.
- The `package-version` pattern supports wildcards. `"1.*"` matches any version starting with `1.`; `"*"` matches all versions.
- When multiple versions of the same package are available, the processor selects the best match according to the W3C version matching rules.
- Circular dependencies between packages are not allowed.
- In Saxon, packages must be pre-compiled to SEF format or provided as source files in the classpath configuration before `xsl:use-package` can resolve them.

## See also

- [xsl:package](../xsl-package)
- [xsl:accept](../xsl-accept)
- [xsl:override](../xsl-override)
