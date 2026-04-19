---
title: "xsl:for-each-group"
description: "Groups a sequence of items by a key expression or adjacent values, then iterates over each distinct group."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "element"
syntax: '<xsl:for-each-group select="sequence" group-by="expression">'
tags: ["xslt", "reference", "xslt2"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvcHJvZHVjdHMiPgogICAgPGdyb3VwZWQ-CiAgICAgIDx4c2w6Zm9yLWVhY2gtZ3JvdXAgc2VsZWN0PSJwcm9kdWN0IiBncm91cC1ieT0iY2F0ZWdvcnkiPgogICAgICAgIDx4c2w6c29ydCBzZWxlY3Q9ImN1cnJlbnQtZ3JvdXBpbmcta2V5KCkiLz4KICAgICAgICA8Z3JvdXAgbmFtZT0ie2N1cnJlbnQtZ3JvdXBpbmcta2V5KCl9Ij4KICAgICAgICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJjdXJyZW50LWdyb3VwKCkiPgogICAgICAgICAgICA8aXRlbT48eHNsOnZhbHVlLW9mIHNlbGVjdD0ibmFtZSIvPjwvaXRlbT4KICAgICAgICAgIDwveHNsOmZvci1lYWNoPgogICAgICAgIDwvZ3JvdXA-CiAgICAgIDwveHNsOmZvci1lYWNoLWdyb3VwPgogICAgPC9ncm91cGVkPgogIDwveHNsOnRlbXBsYXRlPgo8L3hzbDpzdHlsZXNoZWV0Pg&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHByb2R1Y3RzPgogIDxwcm9kdWN0PjxuYW1lPkFwcGxlPC9uYW1lPjxjYXRlZ29yeT5GcnVpdDwvY2F0ZWdvcnk-PC9wcm9kdWN0PgogIDxwcm9kdWN0PjxuYW1lPkNhcnJvdDwvbmFtZT48Y2F0ZWdvcnk-VmVnZXRhYmxlPC9jYXRlZ29yeT48L3Byb2R1Y3Q-CiAgPHByb2R1Y3Q-PG5hbWU-QmFuYW5hPC9uYW1lPjxjYXRlZ29yeT5GcnVpdDwvY2F0ZWdvcnk-PC9wcm9kdWN0PgogIDxwcm9kdWN0PjxuYW1lPkJyb2Njb2xpPC9uYW1lPjxjYXRlZ29yeT5WZWdldGFibGU8L2NhdGVnb3J5PjwvcHJvZHVjdD4KICA8cHJvZHVjdD48bmFtZT5DaGVycnk8L25hbWU-PGNhdGVnb3J5PkZydWl0PC9jYXRlZ29yeT48L3Byb2R1Y3Q-CjwvcHJvZHVjdHM-&version=2.0"
---

## Description

`xsl:for-each-group` divides a sequence into groups and then processes each group once. It replaces the complex Muenchian grouping technique required in XSLT 1.0 with a clean, declarative approach.

There are four mutually exclusive grouping attributes:

- **`group-by`** — groups items that share the same value of the key expression (like SQL `GROUP BY`).
- **`group-adjacent`** — groups consecutive items with the same key value.
- **`group-starting-with`** — starts a new group whenever an item matches a pattern.
- **`group-ending-with`** — ends the current group whenever an item matches a pattern.

Inside the loop body, `current-group()` returns the sequence of items in the current group, and `current-grouping-key()` returns the key value that defines the group (available with `group-by` and `group-adjacent`).

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | XPath expression | Yes | The sequence to be grouped. |
| `group-by` | XPath expression | No* | Key expression evaluated for each item; items with equal keys form a group. |
| `group-adjacent` | XPath expression | No* | Like `group-by` but only consecutive equal-key items are grouped. |
| `group-starting-with` | Pattern | No* | A new group begins each time an item matches the pattern. |
| `group-ending-with` | Pattern | No* | A group ends each time an item matches the pattern. |
| `collation` | URI | No | Collation used for key comparison. |

*Exactly one grouping attribute must be present.

## Examples

### Group items by category

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product><name>Apple</name><category>Fruit</category></product>
  <product><name>Carrot</name><category>Vegetable</category></product>
  <product><name>Banana</name><category>Fruit</category></product>
  <product><name>Broccoli</name><category>Vegetable</category></product>
  <product><name>Cherry</name><category>Fruit</category></product>
</products>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/products">
    <grouped>
      <xsl:for-each-group select="product" group-by="category">
        <xsl:sort select="current-grouping-key()"/>
        <group name="{current-grouping-key()}">
          <xsl:for-each select="current-group()">
            <item><xsl:value-of select="name"/></item>
          </xsl:for-each>
        </group>
      </xsl:for-each-group>
    </grouped>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<grouped>
  <group name="Fruit">
    <item>Apple</item>
    <item>Banana</item>
    <item>Cherry</item>
  </group>
  <group name="Vegetable">
    <item>Carrot</item>
    <item>Broccoli</item>
  </group>
</grouped>
```

### Group adjacent elements (section headings)

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<doc>
  <h1>Introduction</h1>
  <p>First paragraph.</p>
  <p>Second paragraph.</p>
  <h1>Conclusion</h1>
  <p>Final paragraph.</p>
</doc>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/doc">
    <sections>
      <xsl:for-each-group select="*" group-starting-with="h1">
        <section>
          <title><xsl:value-of select="self::h1"/></title>
          <xsl:for-each select="current-group()[not(self::h1)]">
            <para><xsl:value-of select="."/></para>
          </xsl:for-each>
        </section>
      </xsl:for-each-group>
    </sections>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<sections>
  <section>
    <title>Introduction</title>
    <para>First paragraph.</para>
    <para>Second paragraph.</para>
  </section>
  <section>
    <title>Conclusion</title>
    <para>Final paragraph.</para>
  </section>
</sections>
```

## Notes

- `current-group()` is only accessible inside the body of `xsl:for-each-group`.
- `xsl:sort` applies to the order of **groups**, not to the items within each group. Sort items inside `xsl:for-each select="current-group()"` separately.
- Multiple grouping keys can be achieved by nesting `xsl:for-each-group` elements.
- For XSLT 1.0, the equivalent technique is the Muenchian method using `xsl:key` and `generate-id()`. See the [XSLT grouping guide](/posts/xslt-grouping-for-each-group).

## See also

- [xsl:for-each](../xsl-for-each)
- [key()](../xpath-key)
