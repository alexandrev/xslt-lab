---
title: "exactly-one()"
description: "Asserts that the sequence contains exactly one item; raises a dynamic error if the sequence has zero or more than one item."
date: 2026-04-19T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "exactly-one(sequence)"
tags: ["xslt", "reference", "xpath", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9lbXBsb3llZXMiPgogICAgPHJlc3VsdD4KICAgICAgPHhzbDp2YXJpYWJsZSBuYW1lPSJlbXAiIHNlbGVjdD0iZXhhY3RseS1vbmUoZW1wbG95ZWVbQGlkPSdFMDAxJ10pIi8-CiAgICAgIDxmb3VuZD48eHNsOnZhbHVlLW9mIHNlbGVjdD0iJGVtcC9uYW1lIi8-PC9mb3VuZD4KICAgIDwvcmVzdWx0PgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGVtcGxveWVlcz4KICA8ZW1wbG95ZWUgaWQ9IkUwMDEiPjxuYW1lPkFsaWNlPC9uYW1lPjwvZW1wbG95ZWU-CiAgPGVtcGxveWVlIGlkPSJFMDAyIj48bmFtZT5Cb2I8L25hbWU-PC9lbXBsb3llZT4KPC9lbXBsb3llZXM-&version=2.0"
---

## Description

`exactly-one()` is a cardinality assertion function. It returns its argument unchanged if the sequence contains exactly one item, and raises a dynamic error (`FORG0005`) if the sequence is empty or contains more than one item.

Use `exactly-one()` to make cardinality assumptions explicit in your stylesheets. Rather than silently processing zero or multiple nodes when you expect exactly one, the function causes a clear error with a meaningful location. This is particularly valuable for enforcing schema-like constraints when schema validation is not available.

The function is purely an assertion; it performs no transformation of the data and has no effect on correct input.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The sequence that must contain exactly one item. |

## Return value

`item()` — the single item from the sequence, unchanged. Raises `FORG0005` if the sequence does not contain exactly one item.

## Examples

### Asserting a unique key lookup

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<employees>
  <employee id="E001"><name>Alice</name></employee>
  <employee id="E002"><name>Bob</name></employee>
</employees>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/employees">
    <result>
      <xsl:variable name="emp" select="exactly-one(employee[@id='E001'])"/>
      <found><xsl:value-of select="$emp/name"/></found>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <found>Alice</found>
</result>
```

### Catching the error with try/catch (XSLT 3.0)

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:err="http://www.w3.org/2005/xqt-errors">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/employees">
    <result>
      <xsl:try>
        <xsl:variable name="emp" select="exactly-one(employee[@id='UNKNOWN'])"/>
        <found><xsl:value-of select="$emp/name"/></found>
        <xsl:catch errors="*">
          <error>No unique employee found: <xsl:value-of select="$err:description"/></error>
        </xsl:catch>
      </xsl:try>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <error>No unique employee found: ...</error>
</result>
```

## Notes

- The error code raised is `err:FORG0005` defined in the XPath/XQuery Functions and Operators specification.
- `exactly-one()` is equivalent to writing `$seq[1][last() = 1]` as a guard, but is cleaner and raises a standard error code.
- In XSLT 2.0 function signatures, the `item()` return type implicitly asserts exactly one item; `exactly-one()` makes that same assertion in an expression context.
- For sequences that may be empty, use `zero-or-one()` instead; for sequences that must be non-empty, use `one-or-more()`.

## See also

- [zero-or-one()](../xpath-zero-or-one)
- [one-or-more()](../xpath-one-or-more)
- [error()](../xpath-error)
- [deep-equal()](../xpath-deep-equal)
