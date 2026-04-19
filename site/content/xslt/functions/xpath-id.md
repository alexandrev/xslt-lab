---
title: "id()"
description: "Selects elements in the document whose ID attribute value matches the given string or space-separated list of IDs."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "id(string)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`id()` returns a node-set of all elements in the same document as the context node whose **ID-typed attribute** matches one or more ID values provided in the argument.

The argument may be:
- A **string** containing one or more whitespace-separated ID values — each is looked up independently.
- A **node-set** — each node is converted to its string value, that string is treated as a whitespace-separated list of IDs, and all matching elements are returned.

An element participates in ID lookup only if the document has an associated DTD or schema that declares the attribute as type `ID`. Without such a declaration, `id()` will always return an empty node-set, even if an attribute is named `id`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string or node-set | Yes | One or more whitespace-separated ID values to look up. |

## Return value

`node-set` — the elements whose ID-typed attribute matches the given values, in document order, with no duplicates.

## Examples

### Look up a single element by ID (requires DTD)

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE catalog [
  <!ELEMENT catalog (product+)>
  <!ELEMENT product (name)>
  <!ATTLIST product pid ID #REQUIRED>
  <!ELEMENT name (#PCDATA)>
]>
<catalog>
  <product pid="p1"><name>Widget</name></product>
  <product pid="p2"><name>Gadget</name></product>
  <product pid="p3"><name>Doohickey</name></product>
</catalog>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
    <found>
      <xsl:value-of select="id('p2')/name"/>
    </found>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<found>Gadget</found>
```

### Look up multiple elements by a space-separated list

**Input XML (with DTD as above):**

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
    <selection>
      <xsl:for-each select="id('p1 p3')">
        <item><xsl:value-of select="name"/></item>
      </xsl:for-each>
    </selection>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<selection>
  <item>Widget</item>
  <item>Doohickey</item>
</selection>
```

## Notes

- `id()` only works when the XML document has a DTD that declares the attribute type as `ID`. Without a DTD validation pass, the processor has no way to know which attribute holds the ID.
- In practice, many documents use an attribute named `id` or `xml:id` without a DTD. For those, use an XPath predicate such as `//*[@id = 'myId']` or the `key()` function instead.
- `xml:id` (defined by the W3C xml:id specification) is automatically treated as an ID-typed attribute by conforming XSLT 2.0+ processors without requiring a DTD.
- The result node-set is always in document order and contains no duplicates, even if the same ID appears more than once in the argument string.

## See also

- [key()](../xpath-key)
- [generate-id()](../xpath-generate-id)
