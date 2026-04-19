---
title: "xsl:mode"
description: "Declares a named mode and its default behaviour when no template matches, enabling modular transformation strategies in XSLT 3.0."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: '<xsl:mode name="name" on-no-match="shallow-copy|deep-copy|fail|text-only-copy|shallow-skip|deep-skip"/>'
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:mode` is a top-level declaration that gives a named mode an explicit identity and sets its default behaviour when the processor encounters a node for which no matching template exists. In XSLT 2.0 you could use modes informally by naming them in `match` and `apply-templates` attributes, but you had no way to declare what should happen on an unmatched node. XSLT 3.0 fixes this with `xsl:mode`.

The most common use is the *identity transform* shortcut: by setting `on-no-match="shallow-copy"` on the unnamed default mode you get automatic element-and-attribute copying without writing a boilerplate identity template. More specialised modes might use `deep-copy` to recursively copy entire subtrees, or `fail` to make missing templates a hard error during development.

Beyond the default mode you can declare any number of named modes, each with its own `on-no-match` policy. This makes it straightforward to implement a pipeline inside a single stylesheet: one mode normalises, another enriches, a third serialises, and each falls back gracefully when a node does not need special handling.

`xsl:mode` can also carry `streamable="yes"` to opt a mode into streaming processing, and `use-accumulators` to list which accumulators are active while templates in that mode fire.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | QName | No | Mode name. Omit (or use `#default`) for the unnamed default mode. |
| `on-no-match` | token | No | What to do when no template matches. One of `shallow-copy` (default for unnamed mode when declared), `deep-copy`, `shallow-skip`, `deep-skip`, `text-only-copy`, or `fail`. |
| `streamable` | `yes\|no` | No | Whether templates in this mode must be streamable. Default `no`. |
| `use-accumulators` | names | No | Space-separated list of accumulator names active in this mode. |
| `visibility` | token | No | `public`, `private`, or `final` — relevant when packaging. |
| `warning-on-no-match` | `yes\|no` | No | Emit a warning when `on-no-match` triggers. Default is processor-defined. |

## Examples

### Identity transform using on-no-match

The classic use: copy the whole document and override only the nodes you care about.

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report>
  <title>Q1 Results</title>
  <section id="s1">
    <para>Revenue was <b>up</b> 12%.</para>
  </section>
</report>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!-- Declare the default mode to copy anything not matched -->
  <xsl:mode on-no-match="shallow-copy"/>

  <!-- Override only the title element -->
  <xsl:template match="title">
    <heading><xsl:apply-templates/></heading>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<report>
  <heading>Q1 Results</heading>
  <section id="s1">
    <para>Revenue was <b>up</b> 12%.</para>
  </section>
</report>
```

### Named mode with fail policy for strict transformations

Use a named mode that throws an error on any unmatched element, useful during development to catch gaps in coverage.

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:mode name="html-render" on-no-match="fail"/>

  <xsl:template match="/">
    <xsl:apply-templates mode="html-render"/>
  </xsl:template>

  <xsl:template match="report" mode="html-render">
    <html><body><xsl:apply-templates mode="html-render"/></body></html>
  </xsl:template>

  <xsl:template match="title" mode="html-render">
    <h1><xsl:apply-templates mode="html-render"/></h1>
  </xsl:template>

  <xsl:template match="section" mode="html-render">
    <section><xsl:apply-templates mode="html-render"/></section>
  </xsl:template>

  <xsl:template match="para" mode="html-render">
    <p><xsl:apply-templates mode="html-render"/></p>
  </xsl:template>

  <xsl:template match="b" mode="html-render">
    <strong><xsl:apply-templates mode="html-render"/></strong>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `xsl:mode` is a top-level element and must be a direct child of `xsl:stylesheet` or `xsl:transform`.
- When no `xsl:mode` declaration exists for the default mode, XSLT 3.0 processors behave as in 2.0 (built-in text and element templates).
- `on-no-match="shallow-copy"` replaces the classic identity template pattern; you no longer need to write `<xsl:template match="@*|node()"><xsl:copy><xsl:apply-templates select="@*|node()"/></xsl:copy></xsl:template>`.
- Multiple `xsl:mode` declarations for the same mode name in different packages can be composed via `xsl:use-package`.

## See also

- [xsl:template](../xsl-template)
- [xsl:apply-templates](../xsl-apply-templates)
- [xsl:use-accumulators](../xsl-use-accumulators)
- [xsl:package](../xsl-package)
