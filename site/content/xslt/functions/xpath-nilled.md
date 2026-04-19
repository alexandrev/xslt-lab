---
title: "nilled()"
description: "Returns true if an element node is schema-validated and marked as nilled with xsi:nil=\"true\", otherwise returns false."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "node function"
syntax: "nilled(node?)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIj4KICA8eHNsOm91dHB1dCBtZXRob2Q9InhtbCIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iL2VtcGxveWVlcyI-CiAgICA8YWN0aXZlLWVtcGxveWVlcz4KICAgICAgPHhzbDpjb3B5LW9mIHNlbGVjdD0iZW1wbG95ZWVbbm90KG5pbGxlZCguKSldIi8-CiAgICA8L2FjdGl2ZS1lbXBsb3llZXM-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=2.0"
---

## Description

`nilled()` returns `xs:boolean` `true` if the argument is an element node that has been schema-validated and has its **nilled property** set — i.e., the element carries `xsi:nil="true"` and its schema type permits nilling.

For elements that have not been schema-validated, or for non-element nodes, the function returns `false`. If the argument is the empty sequence, the empty sequence is returned.

In practice, `nilled()` is used with schema-aware processors (such as Saxon-EE) to distinguish a genuinely absent value (`xsi:nil="true"`) from an element that is simply empty.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `node` | node()? | No | The node to test. Defaults to the context node. |

## Return value

`xs:boolean?` — `true` if the element is nilled, `false` if it is not, or the empty sequence if the argument is the empty sequence.

## Examples

### Filter out nilled elements

**Input XML (schema-validated):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<employees xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <employee id="1"><name>Alice</name></employee>
  <employee id="2" xsi:nil="true"/>
  <employee id="3"><name>Charlie</name></employee>
</employees>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/employees">
    <active-employees>
      <xsl:copy-of select="employee[not(nilled(.))]"/>
    </active-employees>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<active-employees>
  <employee id="1"><name>Alice</name></employee>
  <employee id="3"><name>Charlie</name></employee>
</active-employees>
```

### Report nil status of each element

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/employees">
    <report>
      <xsl:for-each select="employee">
        <entry id="{@id}" nilled="{nilled(.)}"/>
      </xsl:for-each>
    </report>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `nilled()` only returns `true` for schema-validated elements with `xsi:nil="true"` and a nillable type in the schema. Without schema validation, it always returns `false`.
- For non-schema-aware processing, checking `@xsi:nil = 'true'` directly is a common alternative.
- This function is defined in XPath 2.0 and is not available in XSLT 1.0.

## See also

- [node-name()](../xpath-node-name)
- [base-uri()](../xpath-base-uri)
