---
title: "xsl:array-member"
description: "Defines a single member inside an xsl:array; the member value is any XDM sequence, including nested arrays, maps, or empty sequences."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: '<xsl:array-member select="expression"/>'
tags: ["xslt", "reference", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ianNvbiIgaW5kZW50PSJ5ZXMiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iL21ldHJpY3MiPgogICAgPHhzbDphcnJheT4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9Im1ldHJpYyI-CiAgICAgICAgPHhzbDphcnJheS1tZW1iZXI-CiAgICAgICAgICA8eHNsOm1hcD4KICAgICAgICAgICAgPHhzbDptYXAtZW50cnkga2V5PSInbmFtZSciIHNlbGVjdD0ic3RyaW5nKEBuYW1lKSIvPgogICAgICAgICAgICA8eHNsOm1hcC1lbnRyeSBrZXk9Iid2YWx1ZSciIHNlbGVjdD0ieHM6ZG91YmxlKEB2YWx1ZSkiLz4KICAgICAgICAgIDwveHNsOm1hcD4KICAgICAgICA8L3hzbDphcnJheS1tZW1iZXI-CiAgICAgIDwveHNsOmZvci1lYWNoPgogICAgPC94c2w6YXJyYXk-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPG1ldHJpY3M-CiAgPG1ldHJpYyBuYW1lPSJyZXNwb25zZV90aW1lIiB2YWx1ZT0iMTQyIi8-CiAgPG1ldHJpYyBuYW1lPSJlcnJvcl9yYXRlIiB2YWx1ZT0iMC4wMyIvPgogIDxtZXRyaWMgbmFtZT0idXB0aW1lIiB2YWx1ZT0iOTkuOSIvPgo8L21ldHJpY3M-&version=3.0"
---

## Description

`xsl:array-member` contributes one positional slot to the enclosing `xsl:array`. The value of the member is provided either through the `select` attribute (an XPath expression) or through a sequence constructor in the element content.

The key distinction of `xsl:array-member` is that its value is a *sequence* — not necessarily a single item. A member can be the empty sequence `()`, a single integer, a sequence of strings, or even a nested map or array. This capability is what makes XDM arrays different from flat XPath sequences: arrays can contain heterogeneous multi-value slots.

When using `select`, the expression is evaluated and the resulting sequence becomes the member. When using content, the sequence constructor result becomes the member. You cannot use both `select` and content simultaneously.

In loops (`xsl:for-each`), each iteration of the loop body that contains an `xsl:array-member` adds one member to the enclosing array. This lets you build arrays of arbitrary length from input data.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | expression | No | XPath expression whose result becomes the member value. Mutually exclusive with content. |

## Examples

### Building a JSON array with mixed types

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<metrics>
  <metric name="response_time" value="142"/>
  <metric name="error_rate" value="0.03"/>
  <metric name="uptime" value="99.9"/>
</metrics>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="json" indent="yes"/>

  <xsl:template match="/metrics">
    <xsl:array>
      <xsl:for-each select="metric">
        <xsl:array-member>
          <xsl:map>
            <xsl:map-entry key="'name'" select="string(@name)"/>
            <xsl:map-entry key="'value'" select="xs:double(@value)"/>
          </xsl:map>
        </xsl:array-member>
      </xsl:for-each>
    </xsl:array>
  </xsl:template>
</xsl:stylesheet>
```

**Output (JSON):**
```json
[
  {"name": "response_time", "value": 142},
  {"name": "error_rate", "value": 0.03},
  {"name": "uptime", "value": 99.9}
]
```

### Array of sequences demonstrating multi-value members

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">
  <xsl:output method="xml" indent="yes"/>

  <!-- Each group of tags stored as a sequence in one array slot -->
  <xsl:template match="/articles">
    <xsl:variable name="tag-groups">
      <xsl:array>
        <xsl:for-each select="article">
          <xsl:array-member select="tag/string()"/>
        </xsl:for-each>
      </xsl:array>
    </xsl:variable>
    <result>
      <!-- Tags for first article -->
      <article-1-tags>
        <xsl:value-of select="array:get($tag-groups, 1)" separator=", "/>
      </article-1-tags>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `xsl:array-member` must appear inside `xsl:array` (directly or via instructions that produce array members).
- An `xsl:array-member` with an empty sequence value creates a slot containing `()`, which is distinct from the slot not existing.
- Using `select="()"` explicitly creates an empty-sequence member, valid in XDM.
- In JSON output mode, an array member that is the empty sequence is serialised as `null`.

## See also

- [xsl:array](../xsl-array)
- [array:get()](../xpath-array-get)
