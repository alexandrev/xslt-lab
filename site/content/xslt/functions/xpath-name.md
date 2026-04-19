---
title: "name()"
description: "Returns the qualified name (including namespace prefix, if any) of a node as it appears in the source document."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "name(node?)"
tags: ["xslt", "reference", "xpath", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvY2F0YWxvZyI-CiAgICA8bmFtZXM-CiAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSIvL25zOml0ZW0iIHhtbG5zOm5zPSJodHRwOi8vZXhhbXBsZS5jb20vbnMiPgogICAgICAgIDxlbGVtZW50IG5hbWU9IntuYW1lKCl9Ii8-CiAgICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9IkAqIj4KICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT0ie25hbWUoKX0iLz4KICAgICAgICA8L3hzbDpmb3ItZWFjaD4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L25hbWVzPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNhdGFsb2cgeG1sbnM6bnM9Imh0dHA6Ly9leGFtcGxlLmNvbS9ucyI-CiAgPG5zOml0ZW0gaWQ9IjEiIG5zOmNhdGVnb3J5PSJib29rIj4KICAgIDxuczp0aXRsZT5YTUwgaW4gUHJhY3RpY2U8L25zOnRpdGxlPgogIDwvbnM6aXRlbT4KPC9jYXRhbG9nPg&version=1.0"
---

## Description

`name()` returns the qualified name of a node — the same string that appears in the source document, including the namespace prefix if one was used. For an element declared as `<xhtml:div>`, `name()` returns `"xhtml:div"`.

When called without an argument, it returns the qualified name of the context node. When called with a node-set, it returns the qualified name of the first node in document order.

For nodes that have no name (text nodes, comment nodes, document nodes), `name()` returns the empty string `""`. Processing instruction nodes return the PI target.

Note that the prefix returned by `name()` is the prefix used in the **source document**, which may differ from the prefix declared in the stylesheet. If you need a namespace-safe comparison, use `namespace-uri()` and `local-name()` separately rather than relying on prefix equality.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `node` | node-set | No | The node whose qualified name to return. Defaults to the context node. |

## Return value

`xs:string` — the qualified name of the node as used in the source document, or `""` for unnamed nodes.

## Examples

### Report element and attribute names

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns:ns="http://example.com/ns">
  <ns:item id="1" ns:category="book">
    <ns:title>XML in Practice</ns:title>
  </ns:item>
</catalog>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
    <names>
      <xsl:for-each select="//ns:item" xmlns:ns="http://example.com/ns">
        <element name="{name()}"/>
        <xsl:for-each select="@*">
          <attribute name="{name()}"/>
        </xsl:for-each>
      </xsl:for-each>
    </names>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<names>
  <element name="ns:item"/>
  <attribute name="id"/>
  <attribute name="ns:category"/>
</names>
```

### Dynamic dispatch based on element name

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<form>
  <text-field>username</text-field>
  <password-field>secret</password-field>
  <text-field>email</text-field>
</form>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/form">
    <fields>
      <xsl:for-each select="*">
        <field type="{name()}">
          <xsl:value-of select="."/>
        </field>
      </xsl:for-each>
    </fields>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<fields>
  <field type="text-field">username</field>
  <field type="password-field">secret</field>
  <field type="text-field">email</field>
</fields>
```

## Notes

- `name()` returns the prefix-qualified name as written in the source document. Two documents can use different prefixes for the same namespace URI; therefore, do not compare `name()` values across documents when namespaces are involved.
- For namespace-safe identity comparisons, use `namespace-uri() = 'http://...' and local-name() = 'foo'`.
- `name()` and `local-name()` return the same value for unprefixed nodes.
- In XSLT 2.0+, `fn:name()` is unchanged but the argument must be zero or one node; node-sets with multiple items raise a type error.

## See also

- [local-name()](../xpath-local-name)
- [namespace-uri()](../xpath-namespace-uri)
