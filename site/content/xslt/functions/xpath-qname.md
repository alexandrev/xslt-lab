---
title: "QName()"
description: "Constructs an xs:QName value from a namespace URI and a lexical qualified name string."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "QName function"
syntax: "QName(namespace-uri, lexical-qname)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9yb290Ij4KICAgIDx3aWRnZXRzPgogICAgICA8eHNsOmNvcHktb2Ygc2VsZWN0PSIqW25vZGUtbmFtZSguKSBlcSBRTmFtZSgnaHR0cDovL2V4YW1wbGUuY29tL2FwcCcsICdhcHA6d2lkZ2V0JyldIi8-CiAgICA8L3dpZGdldHM-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QgeG1sbnM6YXBwPSJodHRwOi8vZXhhbXBsZS5jb20vYXBwIj4KICA8YXBwOndpZGdldCB0eXBlPSJidXR0b24iPkNsaWNrIG1lPC9hcHA6d2lkZ2V0PgogIDxhcHA6d2lkZ2V0IHR5cGU9InRleHQiPkVudGVyIHZhbHVlPC9hcHA6d2lkZ2V0PgogIDxvdGhlcjppdGVtIHhtbG5zOm90aGVyPSJodHRwOi8vZXhhbXBsZS5jb20vb3RoZXIiPkV4dHJhPC9vdGhlcjppdGVtPgo8L3Jvb3Q-&version=2.0"
---

## Description

`QName()` creates an `xs:QName` value by combining a namespace URI string with a lexical qualified name (which may include a prefix). This is the primary way to construct typed QName values dynamically in XPath 2.0.

The resulting `xs:QName` can be used for namespace-aware name comparisons, passed to functions like `node-name()`, and used with `element-available()` or `type-available()`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `namespace-uri` | xs:string? | Yes | The namespace URI. Pass an empty string `""` for no namespace. |
| `lexical-qname` | xs:string | Yes | A lexical qualified name, optionally including a prefix (e.g., `"xs:date"` or `"item"`). |

## Return value

`xs:QName` — the constructed QName with the given namespace URI, local name, and prefix.

## Examples

### Compare a node's name to a constructed QName

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns:app="http://example.com/app">
  <app:widget type="button">Click me</app:widget>
  <app:widget type="text">Enter value</app:widget>
  <other:item xmlns:other="http://example.com/other">Extra</other:item>
</root>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/root">
    <widgets>
      <xsl:copy-of select="*[node-name(.) eq QName('http://example.com/app', 'app:widget')]"/>
    </widgets>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<widgets>
  <app:widget xmlns:app="http://example.com/app" type="button">Click me</app:widget>
  <app:widget xmlns:app="http://example.com/app" type="text">Enter value</app:widget>
</widgets>
```

### Dynamically create an element with a qualified name

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/items/item">
    <xsl:variable name="qn" select="QName('http://example.com/out', concat('out:', @type))"/>
    <xsl:element name="{local-name-from-QName($qn)}"
                 namespace="{namespace-uri-from-QName($qn)}">
      <xsl:value-of select="."/>
    </xsl:element>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- The prefix in the `lexical-qname` argument is stored in the `xs:QName` value but has no significance beyond readability — namespace-aware comparison uses the namespace URI and local name only.
- If `namespace-uri` is empty (`""`) and the lexical name contains a colon, an error is raised.
- `QName()` is the typed-value complement of `resolve-QName()`, which resolves namespace prefixes from an element's in-scope namespaces.

## See also

- [local-name-from-QName()](../xpath-local-name-from-qname)
- [namespace-uri-from-QName()](../xpath-namespace-uri-from-qname)
- [prefix-from-QName()](../xpath-prefix-from-qname)
- [resolve-QName()](../xpath-resolve-qname)
