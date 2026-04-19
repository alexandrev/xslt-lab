---
title: "xsl:where-populated"
description: "Suppresses the entire wrapper element, including its start and end tags, when its content sequence constructor produces no nodes."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:where-populated>...</xsl:where-populated>"
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:where-populated` wraps an element constructor and suppresses the *entire* wrapper — open tag, close tag, and everything between — if the content would be empty. This differs from `xsl:on-empty`, which generates fallback content, and from `xsl:on-non-empty`, which conditionally prepends content. `xsl:where-populated` is about wholesale suppression of a wrapping element.

The most frequent problem it solves is the "empty wrapper" antipattern: you want to emit `<errors>...</errors>` only when there are errors, but you cannot know in advance whether any errors exist. The naive approach tests with a variable or `count()`. With `xsl:where-populated` you write the element constructor normally and let the processor decide at runtime whether to emit it.

`xsl:where-populated` must contain exactly one element constructor (a literal result element or `xsl:element`) as its direct child. The processor evaluates the children of that element; if the result is empty, neither the inner element nor `xsl:where-populated` emits anything. If the result is non-empty, the inner element is written to the output as usual.

This element is particularly powerful in streaming stylesheets, where you cannot look ahead.

## Attributes

`xsl:where-populated` has no element-specific attributes. It must contain a single element-constructing child.

## Examples

### Suppress an empty errors wrapper

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<batch>
  <job id="1" status="ok"/>
  <job id="2" status="ok"/>
</batch>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/batch">
    <report>
      <xsl:where-populated>
        <errors>
          <xsl:apply-templates select="job[@status != 'ok']"/>
        </errors>
      </xsl:where-populated>
      <summary>
        <xsl:value-of select="count(job)"/> jobs processed.
      </summary>
    </report>
  </xsl:template>

  <xsl:template match="job">
    <error id="{@id}"><xsl:value-of select="@status"/></error>
  </xsl:template>
</xsl:stylesheet>
```

**Output (no errors element because no failed jobs):**
```xml
<report>
  <summary>2 jobs processed.</summary>
</report>
```

### Combining with xsl:apply-templates in a streaming context

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  <xsl:mode streamable="yes" on-no-match="shallow-skip"/>

  <xsl:template match="/catalog">
    <catalog>
      <xsl:where-populated>
        <featured>
          <xsl:apply-templates select="product[@featured='true']"/>
        </featured>
      </xsl:where-populated>
      <xsl:where-populated>
        <discontinued>
          <xsl:apply-templates select="product[@discontinued='true']"/>
        </discontinued>
      </xsl:where-populated>
    </catalog>
  </xsl:template>

  <xsl:template match="product">
    <item id="{@id}"><xsl:value-of select="name"/></item>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- The direct child of `xsl:where-populated` must be a single element constructor. Wrapping multiple elements requires an outer `xsl:element` or restructuring.
- Text nodes, comments, and processing instructions produced by the inner content are all considered "populated".
- `xsl:where-populated` is streamable.
- It cannot be used to suppress non-element output (e.g. a text node or attribute) — use `xsl:on-empty` for that pattern instead.

## See also

- [xsl:on-empty](../xsl-on-empty)
- [xsl:on-non-empty](../xsl-on-non-empty)
