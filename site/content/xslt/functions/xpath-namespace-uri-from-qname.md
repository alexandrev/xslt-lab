---
title: "namespace-uri-from-QName()"
description: "Returns the namespace URI part of an xs:QName value."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "QName function"
syntax: "namespace-uri-from-QName(qname)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`namespace-uri-from-QName()` extracts the namespace URI from an `xs:QName` value. The URI is the string that uniquely identifies the namespace, not the prefix. If the QName has no namespace, the function returns a zero-length string. If the argument is the empty sequence, the empty sequence is returned.

This function is part of the family of QName accessor functions that decompose an `xs:QName` into its three components: local name, namespace URI, and prefix. The namespace URI is the most stable component because prefixes can be remapped, whereas namespace URIs are authoritative identifiers.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `qname` | xs:QName? | Yes | The QName from which to extract the namespace URI. |

## Return value

`xs:anyURI?` — the namespace URI of the QName, or the empty string if the QName has no namespace, or the empty sequence if the argument is empty.

## Examples

### Decomposing a QName

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="q" select="QName('http://example.com/ns', 'ex:widget')"/>
    <qname-info>
      <uri><xsl:value-of select="namespace-uri-from-QName($q)"/></uri>
      <local><xsl:value-of select="local-name-from-QName($q)"/></local>
      <prefix><xsl:value-of select="prefix-from-QName($q)"/></prefix>
    </qname-info>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<qname-info>
  <uri>http://example.com/ns</uri>
  <local>widget</local>
  <prefix>ex</prefix>
</qname-info>
```

### Checking the namespace of a node

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root xmlns:app="http://myapp.example.com">
  <app:item>content</app:item>
</root>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/root">
    <xsl:for-each select="*">
      Namespace URI: <xsl:value-of select="namespace-uri-from-QName(node-name(.))"/>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
Namespace URI: http://myapp.example.com
```

## Notes

- For a QName with no namespace (created with `QName('', 'localname')`), the function returns a zero-length `xs:anyURI`, not the empty sequence.
- This function is the typed-value equivalent of calling `namespace-uri()` on a node; use `namespace-uri()` directly when working with nodes rather than `xs:QName` values.
- Processors must not confuse a zero-length URI with the empty sequence; the two are distinct results.

## See also

- [local-name-from-QName()](../xpath-local-name-from-qname)
- [prefix-from-QName()](../xpath-prefix-from-qname)
- [resolve-QName()](../xpath-resolve-qname)
- [QName()](../xpath-qname)
