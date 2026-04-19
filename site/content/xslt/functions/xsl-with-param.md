---
title: "xsl:with-param"
description: "Supplies a parameter value to a called or applied template, overriding that template's declared default."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:with-param name="name" select="expression"/>'
tags: ["xslt", "reference", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0idGV4dCIvPgoKICA8eHNsOnRlbXBsYXRlIG5hbWU9ImNvdW50ZG93biI-CiAgICA8eHNsOnBhcmFtIG5hbWU9Im4iLz4KICAgIDx4c2w6aWYgdGVzdD0iJG4gPiAwIj4KICAgICAgPHhzbDp2YWx1ZS1vZiBzZWxlY3Q9IiRuIi8-CiAgICAgIDx4c2w6dGV4dD4mIzEwOzwveHNsOnRleHQ-CiAgICAgIDx4c2w6Y2FsbC10ZW1wbGF0ZSBuYW1lPSJjb3VudGRvd24iPgogICAgICAgIDx4c2w6d2l0aC1wYXJhbSBuYW1lPSJuIiBzZWxlY3Q9IiRuIC0gMSIvPgogICAgICA8L3hzbDpjYWxsLXRlbXBsYXRlPgogICAgPC94c2w6aWY-CiAgPC94c2w6dGVtcGxhdGU-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9Ii9yb290Ij4KICAgIDx4c2w6Y2FsbC10ZW1wbGF0ZSBuYW1lPSJjb3VudGRvd24iPgogICAgICA8eHNsOndpdGgtcGFyYW0gbmFtZT0ibiIgc2VsZWN0PSJjb3VudCIvPgogICAgPC94c2w6Y2FsbC10ZW1wbGF0ZT4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3Q-PGNvdW50PjU8L2NvdW50Pjwvcm9vdD4&version=1.0"
---

## Description

`xsl:with-param` is used inside `xsl:call-template` or `xsl:apply-templates` to pass a value to a parameter declared with `xsl:param` in the target template. It is the mechanism that allows XSLT's otherwise static templates to behave like parameterised subroutines.

The `name` attribute must match the `name` of an `xsl:param` in the called or matched template. The value is specified either via the `select` attribute (an XPath expression evaluated in the current context) or via element content (a result tree fragment). If the target template does not declare a parameter with that name, the value is silently ignored in XSLT 1.0.

`xsl:with-param` must appear as a child of `xsl:call-template` or `xsl:apply-templates` before any other content. When used with `xsl:apply-templates`, all selected nodes receive the same parameter value.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | QName | Yes | Name of the target parameter, matching an `xsl:param` declaration. |
| `select` | XPath expression | No | Expression evaluated in the calling context; its result is the parameter value. |
| `as` | SequenceType | No | (2.0+) Expected type of the value being passed. |
| `tunnel` | `yes` / `no` | No | (2.0+) If `yes`, the parameter is forwarded through intermediate templates automatically. |

## Examples

### Passing a counter through recursive calls

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root><count>5</count></root>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template name="countdown">
    <xsl:param name="n"/>
    <xsl:if test="$n > 0">
      <xsl:value-of select="$n"/>
      <xsl:text>&#10;</xsl:text>
      <xsl:call-template name="countdown">
        <xsl:with-param name="n" select="$n - 1"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <xsl:template match="/root">
    <xsl:call-template name="countdown">
      <xsl:with-param name="n" select="count"/>
    </xsl:call-template>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
5
4
3
2
1
```

### Passing a label to applied templates

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<section prefix="SEC">
  <item>Alpha</item>
  <item>Beta</item>
</section>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/section">
    <list>
      <xsl:apply-templates select="item">
        <xsl:with-param name="label" select="@prefix"/>
      </xsl:apply-templates>
    </list>
  </xsl:template>

  <xsl:template match="item">
    <xsl:param name="label"/>
    <entry id="{$label}-{position()}">
      <xsl:value-of select="."/>
    </entry>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<list>
  <entry id="SEC-1">Alpha</entry>
  <entry id="SEC-2">Beta</entry>
</list>
```

## Notes

- In XSLT 1.0, passing a parameter to a template that does not declare it causes no error — the value is silently discarded. This can hide mistakes; double-check parameter names carefully.
- `xsl:with-param` is evaluated in the context of the calling template, not the called template. XPath expressions see the calling template's variables and context node.
- When used inside `xsl:apply-templates`, all matching templates receive the same parameter values. There is no per-node variation unless you compute different values per node inside the templates themselves.
- Content-based `xsl:with-param` (no `select`, with element children) produces a result tree fragment in XSLT 1.0, subject to the same RTF restrictions as `xsl:variable`.

## See also

- [xsl:param](../xsl-param)
- [xsl:call-template](../xsl-call-template)
- [xsl:apply-templates](../xsl-apply-templates)
- [xsl:variable](../xsl-variable)
