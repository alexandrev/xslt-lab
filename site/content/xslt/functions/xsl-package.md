---
title: "xsl:package"
description: "The root element of an XSLT 3.0 package, a named and versioned reusable unit of stylesheet components."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:package name=\"com.example.pkg\" package-version=\"1.0\" version=\"3.0\">"
tags: ["xslt", "reference", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczptYXRoPSJodHRwOi8vZXhhbXBsZS5jb20vbWF0aC11dGlscyI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dXNlLXBhY2thZ2UgbmFtZT0iaHR0cDovL2V4YW1wbGUuY29tL21hdGgtdXRpbHMiIHBhY2thZ2UtdmVyc2lvbj0iMS4qIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii8iPgogICAgPHJlc3VsdHM-CiAgICAgIDxzcXVhcmU-PHhzbDp2YWx1ZS1vZiBzZWxlY3Q9Im1hdGg6c3F1YXJlKDUpIi8-PC9zcXVhcmU-CiAgICAgIDxjdWJlPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJtYXRoOmN1YmUoMykiLz48L2N1YmU-CiAgICA8L3Jlc3VsdHM-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
---

## Description

`xsl:package` is the root element of a standalone XSLT 3.0 package — a named, versioned unit of XSLT logic that can be shared and reused across multiple stylesheets. Packages are the primary modularity mechanism in XSLT 3.0, superseding the `xsl:import` and `xsl:include` mechanisms for library authoring.

A package has a URI name (the `name` attribute) and a version string (the `package-version` attribute). The `version` attribute specifies the XSLT version in use (always `3.0` for packages). Components within the package are `private` by default; use `xsl:expose` to make them accessible to consuming stylesheets.

Packages can use other packages via `xsl:use-package`. A consuming stylesheet uses `xsl:use-package` to import the package and optionally overrides or re-exposes components.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | xs:anyURI | Yes | A URI that uniquely identifies the package. |
| `package-version` | string | Yes | A version string for this package (e.g. `"1.0"` or `"2.3.1"`). |
| `version` | string | Yes | XSLT version — must be `"3.0"` for packages. |
| `id` | xs:ID | No | An optional XML ID for the package element. |
| `input-type-annotations` | keyword | No | Controls type annotation stripping: `preserve`, `strip`, or `unspecified`. |

## Return value

`xsl:package` is a structural container; it produces no direct output.

## Examples

### A simple utility package

**Package file (math-utils.xsl):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:package version="3.0"
  name="http://example.com/math-utils"
  package-version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:math="http://example.com/math-utils">

  <xsl:expose component="function" match="math:*" visibility="public"/>

  <xsl:function name="math:square" as="xs:double">
    <xsl:param name="n" as="xs:double"/>
    <xsl:sequence select="$n * $n"/>
  </xsl:function>

  <xsl:function name="math:cube" as="xs:double">
    <xsl:param name="n" as="xs:double"/>
    <xsl:sequence select="$n * $n * $n"/>
  </xsl:function>
</xsl:package>
```

### Consuming the package

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:math="http://example.com/math-utils">
  <xsl:output method="xml" indent="yes"/>

  <xsl:use-package name="http://example.com/math-utils" package-version="1.*"/>

  <xsl:template match="/">
    <results>
      <square><xsl:value-of select="math:square(5)"/></square>
      <cube><xsl:value-of select="math:cube(3)"/></cube>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <square>25</square>
  <cube>27</cube>
</results>
```

## Notes

- A package file uses `xsl:package` as its root element instead of `xsl:stylesheet` or `xsl:transform`. An `xsl:package` element may not have a named initial template that serves as the transformation entry point — it is a library, not a runnable transformation.
- The `package-version` string follows no required format, but a dotted version scheme (e.g. `1.2.3`) is conventional and supported by version pattern matching in `xsl:use-package`.
- Packages can use other packages, enabling layered library architectures.
- Processor-specific configuration is needed to tell the processor where to find packages referenced by name.

## See also

- [xsl:use-package](../xsl-use-package)
- [xsl:expose](../xsl-expose)
- [xsl:accept](../xsl-accept)
- [xsl:override](../xsl-override)
