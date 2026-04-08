---
title: "XSLT grouping with xsl:for-each-group: complete guide"
description: "How to group XML nodes in XSLT 2.0 using for-each-group. Covers group-by, group-adjacent, group-starting-with, and group-ending-with with examples."
date: 2025-04-01T00:00:00Z
tags: ["xslt", "grouping", "xslt2", "xpath"]
---

Grouping is one of the most powerful features introduced in XSLT 2.0. Before it, grouping in XSLT 1.0 required the Muenchian method — a clever but verbose technique involving keys and node-set comparisons. In 2.0, `xsl:for-each-group` makes grouping straightforward.

## Basic grouping with group-by

`group-by` groups nodes that share the same value for a given expression. The result is one iteration per distinct group value.

**Input:**
```xml
<orders>
  <order><country>DE</country><amount>120</amount></order>
  <order><country>US</country><amount>85</amount></order>
  <order><country>DE</country><amount>200</amount></order>
  <order><country>FR</country><amount>60</amount></order>
  <order><country>US</country><amount>140</amount></order>
</orders>
```

**Stylesheet:**
```xml
<xsl:template match="orders">
  <summary>
    <xsl:for-each-group select="order" group-by="country">
      <xsl:sort select="current-grouping-key()"/>
      <group country="{current-grouping-key()}">
        <count><xsl:value-of select="count(current-group())"/></count>
        <total><xsl:value-of select="sum(current-group()/amount)"/></total>
      </group>
    </xsl:for-each-group>
  </summary>
</xsl:template>
```

**Output:**
```xml
<summary>
  <group country="DE"><count>2</count><total>320</total></group>
  <group country="FR"><count>1</count><total>60</total></group>
  <group country="US"><count>2</count><total>225</total></group>
</summary>
```

Key functions inside `for-each-group`:
- `current-grouping-key()` — returns the value that defines the current group
- `current-group()` — returns the sequence of all nodes in the current group

## Nested grouping

Groups can be nested. Group orders by country, then within each country by status:

```xml
<xsl:for-each-group select="order" group-by="country">
  <country name="{current-grouping-key()}">
    <xsl:for-each-group select="current-group()" group-by="status">
      <status value="{current-grouping-key()}">
        <xsl:value-of select="count(current-group())"/>
      </status>
    </xsl:for-each-group>
  </country>
</xsl:for-each-group>
```

## group-adjacent

Groups consecutive nodes that share the same key value. Unlike `group-by`, it starts a new group when the key changes, even if the same key appeared earlier. This is useful for processing structured text or segmented data.

```xml
<log>
  <entry level="INFO">Starting</entry>
  <entry level="INFO">Processing</entry>
  <entry level="ERROR">Failed</entry>
  <entry level="ERROR">Retrying</entry>
  <entry level="INFO">Done</entry>
</log>
```

```xml
<xsl:for-each-group select="entry" group-adjacent="@level">
  <block level="{current-grouping-key()}" count="{count(current-group())}">
    <xsl:value-of select="current-group()[1]"/>
  </block>
</xsl:for-each-group>
```

This produces three blocks: two INFO (positions 1-2), one ERROR (3-4), one INFO (5). With `group-by`, the two INFO groups would be merged into one.

## group-starting-with and group-ending-with

These group nodes based on a pattern match rather than a key value. Every time a node matches the pattern, a new group starts (or ends).

**group-starting-with example** — treat every `<h2>` as the start of a section:

```xml
<xsl:for-each-group select="*" group-starting-with="h2">
  <section>
    <title><xsl:value-of select="self::h2"/></title>
    <xsl:apply-templates select="current-group()[position() > 1]"/>
  </section>
</xsl:for-each-group>
```

**group-ending-with example** — group lines until a blank line:

```xml
<xsl:for-each-group select="line" group-ending-with="line[. = '']">
  <paragraph>
    <xsl:apply-templates select="current-group()[. != '']"/>
  </paragraph>
</xsl:for-each-group>
```

## Computing aggregates

`current-group()` returns a sequence, so you can apply any XPath aggregate function directly:

```xml
<xsl:for-each-group select="transaction" group-by="currency">
  <currency code="{current-grouping-key()}">
    <count><xsl:value-of select="count(current-group())"/></count>
    <total><xsl:value-of select="sum(current-group()/amount)"/></total>
    <average><xsl:value-of select="avg(current-group()/amount)"/></average>
    <max><xsl:value-of select="max(current-group()/amount)"/></max>
  </currency>
</xsl:for-each-group>
```

## Try it in XSLT Playground

Paste any of the examples above into [XSLT Playground](https://xsltplayground.com) with version set to 2.0 or 3.0. Grouping is one of the features that benefits most from live testing — you can immediately see how changing the grouping key or switching between `group-by` and `group-adjacent` affects the output structure.
