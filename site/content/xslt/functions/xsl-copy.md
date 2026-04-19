---
title: "xsl:copy"
description: "Creates a shallow copy of the current node — the node itself but not its children or attributes — into the result tree."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:copy use-attribute-sets="names"/>'
tags: ["xslt", "reference", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8IS0tIElkZW50aXR5IHRlbXBsYXRlOiBjb3B5IGV2ZXJ5dGhpbmcgLS0-CiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iQCp8bm9kZSgpIj4KICAgIDx4c2w6Y29weT4KICAgICAgPHhzbDphcHBseS10ZW1wbGF0ZXMgc2VsZWN0PSJAKnxub2RlKCkiLz4KICAgIDwveHNsOmNvcHk-CiAgPC94c2w6dGVtcGxhdGU-CgogIDwhLS0gT3ZlcnJpZGU6IGNoYW5nZSB0aGUgdGl0bGUgLS0-CiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0idGl0bGUiPgogICAgPHRpdGxlPkZpbmFsPC90aXRsZT4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGRvY3VtZW50PgogIDx0aXRsZT5EcmFmdDwvdGl0bGU-CiAgPHNlY3Rpb24gaWQ9InMxIj4KICAgIDxwYXJhPkZpcnN0IHBhcmFncmFwaC48L3BhcmE-CiAgPC9zZWN0aW9uPgo8L2RvY3VtZW50Pg&version=1.0"
---

## Description

`xsl:copy` copies the current context node — and only that node — to the result tree. It is a **shallow** copy: for element nodes, no attributes and no child nodes are included unless you explicitly add them inside the `xsl:copy` body. For text, comment, and processing-instruction nodes, the content is included automatically because those node types have no children.

The most common use of `xsl:copy` is inside the identity transform pattern, where a template matches every node and attribute with `match="@*|node()"`, copies it with `xsl:copy`, and then recursively applies templates to its children. This pattern lets you modify only the parts of a document you care about while passing everything else through unchanged.

When copying an element node, `xsl:copy` also copies the namespace nodes that are in scope for that element, preserving namespace correctness in the output. It does not copy attributes automatically — those must be added explicitly or via `use-attribute-sets`.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `use-attribute-sets` | whitespace-separated QNames | No | Names of `xsl:attribute-set` declarations to expand onto the copied element. |

## Examples

### Identity transform with selective modification

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<document>
  <title>Draft</title>
  <section id="s1">
    <para>First paragraph.</para>
  </section>
</document>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!-- Identity template: copy everything -->
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>

  <!-- Override: change the title -->
  <xsl:template match="title">
    <title>Final</title>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<document>
  <title>Final</title>
  <section id="s1">
    <para>First paragraph.</para>
  </section>
</document>
```

### Copying an element and adding an attribute

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<items>
  <item>Alpha</item>
  <item>Beta</item>
</items>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/items">
    <xsl:copy>
      <xsl:apply-templates select="item"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="item">
    <xsl:copy>
      <xsl:attribute name="pos"><xsl:value-of select="position()"/></xsl:attribute>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<items>
  <item pos="1">Alpha</item>
  <item pos="2">Beta</item>
</items>
```

## Notes

- `xsl:copy` applied to an attribute node copies that attribute to the result element. It must be used when the context node is an attribute and you want to preserve it in the output.
- For a root node, `xsl:copy` copies the root node itself (producing a document node in the result); its children must be processed explicitly.
- To copy a node together with all its descendants without writing extra templates, use `xsl:copy-of` instead.
- The identity transform (`match="@*|node()"`) is an essential XSLT pattern for document editing stylesheets. Always place more specific overriding templates after the identity template, or give them higher `priority`.

## See also

- [xsl:copy-of](../xsl-copy-of)
- [xsl:apply-templates](../xsl-apply-templates)
- [xsl:attribute-set](../xsl-attribute-set)
