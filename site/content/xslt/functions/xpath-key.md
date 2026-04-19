---
title: "key()"
description: "Looks up nodes using a named xsl:key index, returning all nodes whose key value matches the given value."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "key(name, value)"
tags: ["xslt", "reference", "xslt1", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOmtleSBuYW1lPSJkZXB0LWJ5LWlkIiBtYXRjaD0iZGVwdCIgdXNlPSJAaWQiLz4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iL3Jvb3QiPgogICAgPHJlcG9ydD4KICAgICAgPHhzbDpmb3ItZWFjaCBzZWxlY3Q9ImVtcGxveWVlcy9lbXBsb3llZSI-CiAgICAgICAgPGl0ZW0-CiAgICAgICAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0ibmFtZSIvPgogICAgICAgICAgPHhzbDp0ZXh0PiDigJQgPC94c2w6dGV4dD4KICAgICAgICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJrZXkoJ2RlcHQtYnktaWQnLCBAZGVwdCkiLz4KICAgICAgICA8L2l0ZW0-CiAgICAgIDwveHNsOmZvci1lYWNoPgogICAgPC9yZXBvcnQ-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3Q-CiAgPGRlcGFydG1lbnRzPgogICAgPGRlcHQgaWQ9IkQxIj5FbmdpbmVlcmluZzwvZGVwdD4KICAgIDxkZXB0IGlkPSJEMiI-TWFya2V0aW5nPC9kZXB0PgogIDwvZGVwYXJ0bWVudHM-CiAgPGVtcGxveWVlcz4KICAgIDxlbXBsb3llZSBkZXB0PSJEMSI-PG5hbWU-QWxpY2U8L25hbWU-PC9lbXBsb3llZT4KICAgIDxlbXBsb3llZSBkZXB0PSJEMiI-PG5hbWU-Qm9iPC9uYW1lPjwvZW1wbG95ZWU-CiAgICA8ZW1wbG95ZWUgZGVwdD0iRDEiPjxuYW1lPkNhcm9sPC9uYW1lPjwvZW1wbG95ZWU-CiAgPC9lbXBsb3llZXM-Cjwvcm9vdD4&version=1.0"
---

## Description

`key()` retrieves nodes from the source document that have been indexed by an `xsl:key` declaration. It is essentially a pre-built hash-map lookup: you declare the index once with `xsl:key`, and then query it efficiently with `key()`.

The function is used for two main purposes:

1. **Cross-reference lookups** — retrieving a node by an ID-like value without iterating the entire document (much faster than `//element[@id='x']` in large documents).
2. **Muenchian grouping** (XSLT 1.0) — identifying the first node of each group by combining `key()` with `generate-id()`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string literal | Yes | The name of the `xsl:key` index to query (must match the `name` attribute of an `xsl:key` declaration). |
| `value` | string / node-set | Yes | The key value to look up. If a node-set, the result is the union of nodes matching each node's string value. |

### Prerequisite: `xsl:key` declaration

```xml
<xsl:key name="key-name" match="node-pattern" use="key-expression"/>
```

| Attribute | Description |
|-----------|-------------|
| `match` | Pattern identifying which nodes to index. |
| `use` | Expression that provides the key value for each matched node. |

## Return value

A node-set containing all nodes matched by `match` in `xsl:key` whose `use` expression equals `value`.

## Examples

### Cross-reference lookup

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <departments>
    <dept id="D1">Engineering</dept>
    <dept id="D2">Marketing</dept>
  </departments>
  <employees>
    <employee dept="D1"><name>Alice</name></employee>
    <employee dept="D2"><name>Bob</name></employee>
    <employee dept="D1"><name>Carol</name></employee>
  </employees>
</root>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:key name="dept-by-id" match="dept" use="@id"/>

  <xsl:template match="/root">
    <report>
      <xsl:for-each select="employees/employee">
        <item>
          <xsl:value-of select="name"/>
          <xsl:text> — </xsl:text>
          <xsl:value-of select="key('dept-by-id', @dept)"/>
        </item>
      </xsl:for-each>
    </report>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<report>
  <item>Alice — Engineering</item>
  <item>Bob — Marketing</item>
  <item>Carol — Engineering</item>
</report>
```

### Muenchian grouping (XSLT 1.0)

```xml
<xsl:key name="by-category" match="product" use="category"/>

<!-- Select the first product of each distinct category -->
<xsl:for-each select="product[generate-id() = generate-id(key('by-category', category)[1])]">
  <group category="{category}">
    <xsl:value-of select="count(key('by-category', category))"/> items
  </group>
</xsl:for-each>
```

## Notes

- `key()` only works within the **current document** by default. Use `key()` combined with `document()` to look up across external documents.
- The XSLT processor builds the key index once per document, making `key()` significantly faster than predicate-based searches for repeated lookups.
- In XSLT 2.0+, `xsl:for-each-group` replaces Muenchian grouping with a cleaner syntax.
- If `name` does not match any `xsl:key` declaration, the result is an error.

## See also

- [xsl:for-each-group](../xsl-for-each-group)
