---
title: "one-or-more()"
description: "Asserts that the sequence contains one or more items; raises a dynamic error if the sequence is empty."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "one-or-more(sequence)"
tags: ["xslt", "reference", "xpath", "xslt2"]
---

## Description

`one-or-more()` is a cardinality assertion function. It returns its argument unchanged when the sequence contains at least one item, and raises a dynamic error (`FORG0004`) if the sequence is empty. The function has no effect on sequences of two or more items.

Use `one-or-more()` to document and enforce the assumption that a set of nodes must not be empty — for example when deriving a result from a required configuration element, or when a stylesheet would produce meaningless output if no input nodes matched. Asserting this explicitly makes the stylesheet self-documenting and avoids silent failures.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The sequence that must contain one or more items. |

## Return value

`item()+` — the original sequence, unchanged. Raises `FORG0004` if the sequence is empty.

## Examples

### Enforcing required configuration

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>
  <endpoint>https://api.example.com</endpoint>
  <endpoint>https://backup.example.com</endpoint>
</config>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/config">
    <urls>
      <xsl:for-each select="one-or-more(endpoint)">
        <url><xsl:value-of select="."/></url>
      </xsl:for-each>
    </urls>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<urls>
  <url>https://api.example.com</url>
  <url>https://backup.example.com</url>
</urls>
```

### Combining with string-join

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<tags>
  <tag>xslt</tag>
  <tag>xml</tag>
  <tag>xpath</tag>
</tags>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/tags">
    <xsl:value-of select="string-join(one-or-more(tag), ', ')"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
xslt, xml, xpath
```

## Notes

- The error code raised for an empty sequence is `err:FORG0004`.
- `one-or-more()` is the XPath equivalent of a database `NOT NULL` or `EXISTS` constraint applied at transformation time.
- When the stylesheet is intended to run against schema-validated documents, `one-or-more()` duplicates validation that the schema already performs; its value is greatest in schema-free environments.
- Use `zero-or-one()` when zero items is acceptable, and `exactly-one()` when the count must be precisely one.

## See also

- [exactly-one()](../xpath-exactly-one)
- [zero-or-one()](../xpath-zero-or-one)
- [error()](../xpath-error)
- [empty()](../xpath-empty)
