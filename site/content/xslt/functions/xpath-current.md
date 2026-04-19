---
title: "current()"
description: "Returns the context node of the innermost xsl:template or xsl:for-each, unaffected by nested predicates."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "current()"
tags: ["xslt", "reference", "xslt1", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvcm9vdCI-CiAgICA8cmVzdWx0PgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0icHJvZHVjdHMvcHJvZHVjdCI-CiAgICAgICAgPGl0ZW0-CiAgICAgICAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0ibmFtZSIvPgogICAgICAgICAgPHhzbDp0ZXh0PiDigJQgPC94c2w6dGV4dD4KICAgICAgICAgIDwhLS0gY3VycmVudCgpIGlzIHRoZSBwcm9kdWN0OyAuIGluc2lkZSB0aGUgcHJlZGljYXRlIHdvdWxkIGJlIHRoZSBjYXRlZ29yeSAtLT4KICAgICAgICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIvcm9vdC9jYXRlZ29yaWVzL2NhdGVnb3J5W0BpZCA9IGN1cnJlbnQoKS9AY2F0XSIvPgogICAgICAgIDwvaXRlbT4KICAgICAgPC94c2w6Zm9yLWVhY2g-CiAgICA8L3Jlc3VsdD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3Q-CiAgPGNhdGVnb3JpZXM-CiAgICA8Y2F0ZWdvcnkgaWQ9IkEiPkVsZWN0cm9uaWNzPC9jYXRlZ29yeT4KICAgIDxjYXRlZ29yeSBpZD0iQiI-Qm9va3M8L2NhdGVnb3J5PgogIDwvY2F0ZWdvcmllcz4KICA8cHJvZHVjdHM-CiAgICA8cHJvZHVjdCBjYXQ9IkEiPjxuYW1lPkxhcHRvcDwvbmFtZT48L3Byb2R1Y3Q-CiAgICA8cHJvZHVjdCBjYXQ9IkIiPjxuYW1lPlhTTFQgR3VpZGU8L25hbWU-PC9wcm9kdWN0PgogIDwvcHJvZHVjdHM-Cjwvcm9vdD4&version=1.0"
---

## Description

`current()` returns the **current node** — the node being processed by the nearest enclosing `xsl:template` or `xsl:for-each` instruction. This is different from the **context node** (`.`), which shifts to each node evaluated inside predicates and path steps.

The key distinction is:

- `.` (dot) refers to the node currently in focus in an XPath sub-expression, which can change as XPath navigates through predicates.
- `current()` always refers to the XSLT processing context (the node the instruction is currently transforming), regardless of how deeply nested the XPath expression is.

`current()` is most useful inside predicates when you need to refer back to the outer node being processed, for example to perform a cross-reference lookup based on a value from the current node.

`current()` is an XSLT function, not a pure XPath function — it is only valid inside XSLT stylesheets, not standalone XPath expressions.

## Return value

A node-set containing exactly one node: the current XSLT processing context node.

## Examples

### Cross-reference using current() in a predicate

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <categories>
    <category id="A">Electronics</category>
    <category id="B">Books</category>
  </categories>
  <products>
    <product cat="A"><name>Laptop</name></product>
    <product cat="B"><name>XSLT Guide</name></product>
  </products>
</root>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/root">
    <result>
      <xsl:for-each select="products/product">
        <item>
          <xsl:value-of select="name"/>
          <xsl:text> — </xsl:text>
          <!-- current() is the product; . inside the predicate would be the category -->
          <xsl:value-of select="/root/categories/category[@id = current()/@cat]"/>
        </item>
      </xsl:for-each>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <item>Laptop — Electronics</item>
  <item>XSLT Guide — Books</item>
</result>
```

### Why current() differs from dot

```xml
<!-- Inside the predicate, "." refers to the category node, not the product.
     Without current(), @cat would look for an attribute on the category element. -->

<!-- Correct: -->
<xsl:value-of select="/root/categories/category[@id = current()/@cat]"/>

<!-- Wrong (would compare @id to category's own @cat, not the product's @cat): -->
<xsl:value-of select="/root/categories/category[@id = @cat]"/>
```

## Notes

- `current()` is only meaningful inside an `xsl:template` or `xsl:for-each`. Calling it at the top level of a match pattern is an error.
- It cannot be used inside `xsl:key`'s `use` attribute — that is evaluated outside of any XSLT instruction context.
- In XSLT 2.0+, the need for `current()` is often reduced by using variables (`xsl:variable`) to capture the node before entering a predicate.
- `current()` and `.` are identical outside any predicate or path step.

## See also

- [xsl:for-each](../xsl-for-each)
