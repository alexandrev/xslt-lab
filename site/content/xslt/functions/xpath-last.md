---
title: "last()"
description: "Returns the size of the context node-set, i.e. the index of the last item in the current iteration context."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "last()"
tags: ["xslt", "reference", "xslt1", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0idGV4dCIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvY29sb3JzIj4KICAgIDx4c2w6Zm9yLWVhY2ggc2VsZWN0PSJjb2xvciI-CiAgICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSIuIi8-CiAgICAgIDx4c2w6aWYgdGVzdD0icG9zaXRpb24oKSAhPSBsYXN0KCkiPiwgPC94c2w6aWY-CiAgICA8L3hzbDpmb3ItZWFjaD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGNvbG9ycz4KICA8Y29sb3I-UmVkPC9jb2xvcj4KICA8Y29sb3I-R3JlZW48L2NvbG9yPgogIDxjb2xvcj5CbHVlPC9jb2xvcj4KPC9jb2xvcnM-&version=1.0"
---

## Description

`last()` returns an integer equal to the **context size** — the total number of nodes in the node-set (or items in the sequence) currently being processed. It takes no arguments.

The most common use cases are:

- Detecting the last item in a loop to apply different formatting (e.g., omitting a trailing separator).
- Building predicates like `item[last()]` to select only the final element in a set.
- Combining with `position()` to produce row counts or progress labels.

The value of `last()` changes with the context. Inside `xsl:for-each`, it reflects the number of items selected by the `select` attribute. Inside a template triggered by `xsl:apply-templates`, it reflects the number of nodes sent to that template call.

## Return value

`xs:integer` — the total number of items in the current context sequence.

## Examples

### Omit trailing comma

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<colors>
  <color>Red</color>
  <color>Green</color>
  <color>Blue</color>
</colors>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/colors">
    <xsl:for-each select="color">
      <xsl:value-of select="."/>
      <xsl:if test="position() != last()">, </xsl:if>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
Red, Green, Blue
```

### Select only the last element

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/colors">
    <xsl:value-of select="color[last()]"/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
Blue
```

## Notes

- `last()` and `position()` are context-dependent. Their values inside a predicate differ from their values in the body of `xsl:for-each` — predicates establish their own context.
- In XSLT 2.0+ with typed sequences, `last()` still works the same way but the context is an `xs:integer`-typed sequence size.
- A common mistake is calling `last()` outside any iterating context; at the top level of a template, it returns 1 (the single context node).

## See also

- [position()](../xpath-position)
- [count()](../xpath-count)
