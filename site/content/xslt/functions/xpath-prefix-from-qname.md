---
title: "prefix-from-QName()"
description: "Returns the namespace prefix of an xs:QName value, or the empty sequence if the QName has no prefix."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "QName function"
syntax: "prefix-from-QName(qname)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`prefix-from-QName()` returns the prefix component of an `xs:QName` value as an `xs:NCName`. The prefix is the part before the colon in a prefixed name. If the QName was created without a prefix — for example with `QName('http://example.com', 'item')` — the function returns the empty sequence, not a zero-length string.

Prefixes are not inherently meaningful in XML; what matters is the namespace URI. Consequently this function is primarily used for producing human-readable output or for round-tripping serialized QNames back to string form. Do not use prefix equality to compare namespaces; use `namespace-uri-from-QName()` instead.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `qname` | xs:QName? | Yes | The QName from which to extract the prefix. |

## Return value

`xs:NCName?` — the prefix of the QName, or the empty sequence if the QName has no prefix or the argument is the empty sequence.

## Examples

### Extracting prefix from a constructed QName

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <prefixes>
      <with-prefix>
        <xsl:value-of select="prefix-from-QName(QName('http://example.com', 'ex:item'))"/>
      </with-prefix>
      <without-prefix>
        <xsl:value-of select="(prefix-from-QName(QName('http://example.com', 'item')), 'none')[1]"/>
      </without-prefix>
    </prefixes>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<prefixes>
  <with-prefix>ex</with-prefix>
  <without-prefix>none</without-prefix>
</prefixes>
```

### Round-tripping a QName to string

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="text"/>

  <xsl:function name="f:qname-to-string" as="xs:string"
    xmlns:f="urn:functions">
    <xsl:param name="q" as="xs:QName"/>
    <xsl:variable name="p" select="prefix-from-QName($q)"/>
    <xsl:sequence select="if ($p) then concat($p, ':', local-name-from-QName($q)) else string(local-name-from-QName($q))"/>
  </xsl:function>

  <xsl:template match="/" xmlns:f="urn:functions">
    <xsl:value-of select="f:qname-to-string(QName('http://example.com', 'ex:order'))"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
ex:order
```

## Notes

- The prefix is part of the `xs:QName` value only if it was present when the QName was constructed; `QName('http://example.com', 'item')` creates a QName with no prefix.
- Avoid using prefix equality as a substitute for namespace URI equality. Two QNames with different prefixes bound to the same namespace URI are semantically identical.
- `prefix-from-QName()` returns the empty sequence (not an empty string) when no prefix is present. Check with `exists()` rather than comparing to `''`.

## See also

- [local-name-from-QName()](../xpath-local-name-from-qname)
- [namespace-uri-from-QName()](../xpath-namespace-uri-from-qname)
- [resolve-QName()](../xpath-resolve-qname)
- [QName()](../xpath-qname)
