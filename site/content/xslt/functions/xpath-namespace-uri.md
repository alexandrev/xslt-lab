---
title: "namespace-uri()"
description: "Returns the namespace URI of a node's expanded name, or an empty string if the node has no namespace."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "namespace-uri(node?)"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvcm9vdCI-CiAgICA8aW5mbz4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9IioiPgogICAgICAgIDxub2RlIG5hbWU9Intsb2NhbC1uYW1lKCl9IiBucz0ie25hbWVzcGFjZS11cmkoKX0iLz4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L2luZm8-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3Q-CiAgPHhodG1sOnAgeG1sbnM6eGh0bWw9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwiPlhIVE1MIHBhcmFncmFwaDwveGh0bWw6cD4KICA8cD5QbGFpbiBwYXJhZ3JhcGg8L3A-CiAgPHN2ZzpyZWN0IHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiLz4KPC9yb290Pg&version=1.0"
---

## Description

`namespace-uri()` returns the namespace URI part of a node's expanded name. For an element `<xhtml:div xmlns:xhtml="http://www.w3.org/1999/xhtml">`, `namespace-uri()` returns `"http://www.w3.org/1999/xhtml"`.

When called without an argument, it returns the namespace URI of the context node. When called with a node-set, it returns the namespace URI of the first node in document order.

The function returns `""` (empty string) for:
- Nodes with no namespace (unprefixed elements in a document without a default namespace, attributes without a prefix).
- Nodes that inherently have no name: text nodes, comment nodes, document nodes.
- The `xml:` prefix namespace (`http://www.w3.org/XML/1998/namespace`) is a valid URI that will be returned if the `xml:` prefix is used.

`namespace-uri()` is essential for writing namespace-portable stylesheets that identify elements by their canonical URI rather than by the potentially varying prefix used in each source document.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `node` | node-set | No | The node to inspect. Defaults to the context node. |

## Return value

`xs:string` — the namespace URI of the node, or `""` if the node has no namespace.

## Examples

### Identify elements by namespace URI

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <xhtml:p xmlns:xhtml="http://www.w3.org/1999/xhtml">XHTML paragraph</xhtml:p>
  <p>Plain paragraph</p>
  <svg:rect xmlns:svg="http://www.w3.org/2000/svg" width="100" height="50"/>
</root>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/root">
    <info>
      <xsl:for-each select="*">
        <node name="{local-name()}" ns="{namespace-uri()}"/>
      </xsl:for-each>
    </info>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<info>
  <node name="p" ns="http://www.w3.org/1999/xhtml"/>
  <node name="p" ns=""/>
  <node name="rect" ns="http://www.w3.org/2000/svg"/>
</info>
```

### Filter elements from a specific namespace

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<doc>
  <html:div xmlns:html="http://www.w3.org/1999/xhtml">Section A</html:div>
  <div>Plain div</div>
  <html:span xmlns:html="http://www.w3.org/1999/xhtml">Span</html:span>
</doc>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/doc">
    <xhtml-only>
      <xsl:for-each select="*[namespace-uri() = 'http://www.w3.org/1999/xhtml']">
        <item><xsl:value-of select="."/></item>
      </xsl:for-each>
    </xhtml-only>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<xhtml-only>
  <item>Section A</item>
  <item>Span</item>
</xhtml-only>
```

## Notes

- For attributes without a prefix, `namespace-uri()` returns `""` even if they are in scope inside a namespaced element. In XML, unprefixed attributes are not in any namespace.
- The `xml:` prefix is predeclared and always maps to `http://www.w3.org/XML/1998/namespace`; `namespace-uri()` on an `xml:lang` attribute returns that URI.
- Never rely on `name()` for namespace-aware matching across documents — always use `namespace-uri()` and `local-name()` together.
- In XSLT 2.0+, `fn:namespace-uri()` is unchanged. The argument must be zero or one node.

## See also

- [local-name()](../xpath-local-name)
- [name()](../xpath-name)
