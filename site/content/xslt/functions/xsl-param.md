---
title: "xsl:param"
description: "Declares a parameter with an optional default value, accepting values passed via xsl:with-param or from the calling environment."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:param name="name" select="expression" as="type" required="no"/>'
tags: ["xslt", "reference", "xslt1"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjEuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0idGV4dCIvPgoKICA8eHNsOnRlbXBsYXRlIG5hbWU9ImdyZWV0Ij4KICAgIDx4c2w6cGFyYW0gbmFtZT0ibmFtZSI-V29ybGQ8L3hzbDpwYXJhbT4KICAgIDx4c2w6cGFyYW0gbmFtZT0icHJlZml4IiBzZWxlY3Q9IidIaSciLz4KICAgIDx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJjb25jYXQoJHByZWZpeCwgJywgJywgJG5hbWUsICchJykiLz4KICA8L3hzbDp0ZW1wbGF0ZT4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iL21lc3NhZ2UiPgogICAgPHhzbDpjYWxsLXRlbXBsYXRlIG5hbWU9ImdyZWV0Ij4KICAgICAgPHhzbDp3aXRoLXBhcmFtIG5hbWU9Im5hbWUiPlNheG9uPC94c2w6d2l0aC1wYXJhbT4KICAgIDwveHNsOmNhbGwtdGVtcGxhdGU-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPG1lc3NhZ2U-SGVsbG88L21lc3NhZ2U-&version=1.0"
---

## Description

`xsl:param` declares a named parameter. It is syntactically similar to `xsl:variable`, but its value can be overridden by the caller at the point of invocation. If the caller does not supply a value, the default expressed by `select` or element content is used instead.

Like `xsl:variable`, `xsl:param` can appear at two levels:

- **Top-level** (direct child of `xsl:stylesheet`): declares a global stylesheet parameter. XSLT processors typically allow the host environment (a Java application, a command-line tool, or a browser) to supply values for top-level parameters at runtime.
- **Inside `xsl:template`**: declares a template parameter. The value is supplied by `xsl:with-param` in the calling `xsl:apply-templates` or `xsl:call-template`.

Once set for a given invocation, a parameter is immutable — you cannot reassign it inside the template body, just as with `xsl:variable`.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | QName | Yes | The parameter name, referenced as `$name` in XPath. |
| `select` | XPath expression | No | Default value expression. Used when caller does not provide a value. |
| `as` | SequenceType | No | (2.0+) Expected type for type-checking. |
| `required` | `yes` / `no` | No | (2.0+) If `yes`, raises an error when no value is passed. Default `no`. |
| `tunnel` | `yes` / `no` | No | (2.0+) Tunnel parameters bypass intermediate templates automatically. |

## Examples

### Template parameter with default

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<message>Hello</message>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template name="greet">
    <xsl:param name="name">World</xsl:param>
    <xsl:param name="prefix" select="'Hi'"/>
    <xsl:value-of select="concat($prefix, ', ', $name, '!')"/>
  </xsl:template>

  <xsl:template match="/message">
    <xsl:call-template name="greet">
      <xsl:with-param name="name">Saxon</xsl:with-param>
    </xsl:call-template>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
Hi, Saxon!
```

### Top-level stylesheet parameter

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<report><total>1500</total></report>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:param name="currency">USD</xsl:param>
  <xsl:param name="multiplier" select="1"/>

  <xsl:template match="/report">
    <result>
      <amount>
        <xsl:value-of select="format-number(total * $multiplier, '#,##0.00')"/>
        <xsl:text> </xsl:text>
        <xsl:value-of select="$currency"/>
      </amount>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output** (with default parameters):
```xml
<result>
  <amount>1,500.00 USD</amount>
</result>
```

## Notes

- A template parameter that is not passed by the caller silently uses its default value. In XSLT 1.0, there is no way to make a parameter required at the language level; you must check with `xsl:if` and emit `xsl:message` if needed.
- `xsl:param` must appear before any other instructions in a template body; placing it after variable declarations or output instructions is an error.
- Global parameters supplied by the host environment are typically strings. Numeric or node-set values may require explicit conversion in the stylesheet.
- In XSLT 2.0+, the `required="yes"` attribute provides a first-class mechanism for mandatory parameters, removing the need for manual guard checks.

## See also

- [xsl:variable](../xsl-variable)
- [xsl:with-param](../xsl-with-param)
- [xsl:call-template](../xsl-call-template)
- [xsl:apply-templates](../xsl-apply-templates)
