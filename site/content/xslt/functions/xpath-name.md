---
title: "name()"
description: "Returns the qualified name (including namespace prefix, if any) of a node as it appears in the source document."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "name(node?)"
tags: ["xslt", "reference", "xpath", "xslt1"]
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
