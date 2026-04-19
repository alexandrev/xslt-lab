---
title: "empty()"
description: "Returns true if the sequence has zero items, and false if it contains one or more items."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "sequence function"
syntax: "empty(sequence)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvY2F0YWxvZyI-CiAgICA8cmVwb3J0PgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0icHJvZHVjdCI-CiAgICAgICAgPHByb2R1Y3QgaWQ9IntAaWR9IgogICAgICAgICAgICAgICAgIGhhcy10YWdzPSJ7aWYgKGVtcHR5KHRhZ3MvdGFnKSkgdGhlbiAnbm8nIGVsc2UgJ3llcyd9Ij4KICAgICAgICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJuYW1lIi8-CiAgICAgICAgPC9wcm9kdWN0PgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwvcmVwb3J0PgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNhdGFsb2c-CiAgPHByb2R1Y3QgaWQ9IkEiPjxuYW1lPkFscGhhPC9uYW1lPjx0YWdzPjx0YWc-eG1sPC90YWc-PC90YWdzPjwvcHJvZHVjdD4KICA8cHJvZHVjdCBpZD0iQiI-PG5hbWU-QmV0YTwvbmFtZT48dGFncy8-PC9wcm9kdWN0PgogIDxwcm9kdWN0IGlkPSJDIj48bmFtZT5HYW1tYTwvbmFtZT48L3Byb2R1Y3Q-CjwvY2F0YWxvZz4&version=2.0"
---

## Description

`empty()` tests whether a sequence contains no items. It is the logical complement of `exists()`: `empty($s)` is equivalent to `not(exists($s))` and to `count($s) = 0`, but is more readable and may be more efficient because the processor can stop as soon as it finds any item.

The sequence argument may be any XPath expression — a node selection, a function result, or a constructed sequence.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sequence` | item()* | Yes | The sequence to test. |

## Return value

`xs:boolean` — `true` if the sequence is empty, `false` otherwise.

## Examples

### Checking for missing child elements

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <product id="A"><name>Alpha</name><tags><tag>xml</tag></tags></product>
  <product id="B"><name>Beta</name><tags/></product>
  <product id="C"><name>Gamma</name></product>
</catalog>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
    <report>
      <xsl:for-each select="product">
        <product id="{@id}"
                 has-tags="{if (empty(tags/tag)) then 'no' else 'yes'}">
          <xsl:value-of select="name"/>
        </product>
      </xsl:for-each>
    </report>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<report>
  <product id="A" has-tags="yes">Alpha</product>
  <product id="B" has-tags="no">Beta</product>
  <product id="C" has-tags="no">Gamma</product>
</report>
```

### Providing a default when a sequence is empty

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <xsl:variable name="items" select="item[@active='true']"/>
    <result>
      <xsl:choose>
        <xsl:when test="empty($items)">
          <message>No active items found.</message>
        </xsl:when>
        <xsl:otherwise>
          <xsl:for-each select="$items">
            <item><xsl:value-of select="."/></item>
          </xsl:for-each>
        </xsl:otherwise>
      </xsl:choose>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `empty($seq)` is semantically equivalent to `not($seq)` for sequences, but is preferred for clarity when working with typed sequences.
- For node selections, `empty(//foo)` is more readable than `not(//foo)`, especially in predicate contexts.
- `empty()` short-circuits: it does not need to evaluate the entire sequence; it stops at the first item.
- Use `exists()` to test the positive case; avoid double negation with `not(empty(...))`.

## See also

- [exists()](../xpath-exists)
- [count()](../xpath-count)
- [zero-or-one()](../xpath-zero-or-one)
