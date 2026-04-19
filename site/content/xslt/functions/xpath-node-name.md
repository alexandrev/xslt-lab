---
title: "node-name()"
description: "Returns the name of a node as an xs:QName value, capturing both the namespace URI and the local name."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "node-name(node?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczphPSJodHRwOi8vZXhhbXBsZS5jb20vYSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9yb290Ij4KICAgIDxtYXRjaGVzPgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0iKiI-CiAgICAgICAgPCEtLSBub2RlLW5hbWUoKSBlcSBRTmFtZSgpIGNvbXBhcmVzIG5hbWVzcGFjZS1hd2FyZSAtLT4KICAgICAgICA8bWF0Y2ggbmFtZT0ie2xvY2FsLW5hbWUtZnJvbS1RTmFtZShub2RlLW5hbWUoLikpfSIKICAgICAgICAgICAgICAgbnM9IntuYW1lc3BhY2UtdXJpLWZyb20tUU5hbWUobm9kZS1uYW1lKC4pKX0iLz4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L21hdGNoZXM-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QgeG1sbnM6YT0iaHR0cDovL2V4YW1wbGUuY29tL2EiIHhtbG5zOmI9Imh0dHA6Ly9leGFtcGxlLmNvbS9iIj4KICA8YTppdGVtPkZpcnN0PC9hOml0ZW0-CiAgPGI6aXRlbT5TZWNvbmQ8L2I6aXRlbT4KPC9yb290Pg&version=2.0"
---

## Description

`node-name()` returns the name of an element or attribute node as an `xs:QName`. This is the typed equivalent of `name()` or `local-name()`: rather than returning a string, it returns a structured value from which you can extract the namespace URI, local name, and prefix separately.

For text nodes, comments, and document nodes, the function returns the empty sequence. When called without an argument, the context node is used.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `node` | node()? | No | The node whose name is requested. Defaults to the context node. |

## Return value

`xs:QName?` — the qualified name of the node, or the empty sequence for text, comment, and document nodes.

## Examples

### Compare node names using QName equality

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns:a="http://example.com/a" xmlns:b="http://example.com/b">
  <a:item>First</a:item>
  <b:item>Second</b:item>
</root>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:a="http://example.com/a">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/root">
    <matches>
      <xsl:for-each select="*">
        <!-- node-name() eq QName() compares namespace-aware -->
        <match name="{local-name-from-QName(node-name(.))}"
               ns="{namespace-uri-from-QName(node-name(.))}"/>
      </xsl:for-each>
    </matches>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<matches>
  <match name="item" ns="http://example.com/a"/>
  <match name="item" ns="http://example.com/b"/>
</matches>
```

### Dispatch based on qualified name

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:a="http://example.com/a">
  <xsl:output method="text"/>

  <xsl:template match="/root/*">
    <xsl:choose>
      <xsl:when test="node-name(.) eq QName('http://example.com/a', 'item')">
        <xsl:value-of select="concat('Namespace A item: ', ., '&#10;')"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="concat('Other item: ', ., '&#10;')"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- Use `local-name-from-QName()`, `namespace-uri-from-QName()`, and `prefix-from-QName()` to decompose the returned `xs:QName`.
- `node-name()` is namespace-aware; for a simple string name, `name()` or `local-name()` may be sufficient.
- The prefix in the returned QName reflects the prefix used in the source document, which may differ from the prefix in the stylesheet.

## See also

- [local-name-from-QName()](../xpath-local-name-from-qname)
- [namespace-uri-from-QName()](../xpath-namespace-uri-from-qname)
- [QName()](../xpath-qname)
