---
title: "xsl:on-empty"
description: "Generates fallback content when the sibling sequence constructor produces no nodes, enabling clean empty-state handling without extra variables."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: "<xsl:on-empty>...</xsl:on-empty>"
tags: ["xslt", "reference", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSI-CiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJodG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvbGlicmFyeSI-CiAgICA8dWw-CiAgICAgIDx4c2w6YXBwbHktdGVtcGxhdGVzIHNlbGVjdD0iYm9va3MvYm9vayIvPgogICAgICA8eHNsOm9uLWVtcHR5PgogICAgICAgIDxsaSBjbGFzcz0iZW1wdHkiPk5vIGJvb2tzIGF2YWlsYWJsZS48L2xpPgogICAgICA8L3hzbDpvbi1lbXB0eT4KICAgIDwvdWw-CiAgPC94c2w6dGVtcGxhdGU-CgogIDx4c2w6dGVtcGxhdGUgbWF0Y2g9ImJvb2siPgogICAgPGxpPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJ0aXRsZSIvPjwvbGk-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGxpYnJhcnk-CiAgPGJvb2tzPgogICAgPCEtLSBubyBib29rIGVsZW1lbnRzIGhlcmUgLS0-CiAgPC9ib29rcz4KPC9saWJyYXJ5Pg&version=3.0"
---

## Description

`xsl:on-empty` solves a recurring XSLT problem: how do you output something meaningful when a query returns no results? Before XSLT 3.0 you had to bind the result to a variable, test whether the variable was empty, and then branch with `xsl:choose`. `xsl:on-empty` eliminates this boilerplate by acting as an inline fallback within the same sequence of instructions.

The element is evaluated *after* all preceding siblings in the same sequence constructor have been evaluated. If those siblings produced no nodes at all — not even whitespace-only text nodes — then the content of `xsl:on-empty` is output instead. If any node was produced, `xsl:on-empty` is silently skipped.

This is particularly useful in streaming contexts where you cannot look ahead to know whether content exists before committing to write a wrapper element. Paired with `xsl:on-non-empty` and `xsl:where-populated`, these three elements form a trio for conditional-content control in XSLT 3.0.

## Attributes

`xsl:on-empty` has no element-specific attributes. It contains a sequence constructor.

## Examples

### Empty list fallback

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<library>
  <books>
    <!-- no book elements here -->
  </books>
</library>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/library">
    <ul>
      <xsl:apply-templates select="books/book"/>
      <xsl:on-empty>
        <li class="empty">No books available.</li>
      </xsl:on-empty>
    </ul>
  </xsl:template>

  <xsl:template match="book">
    <li><xsl:value-of select="title"/></li>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```html
<ul>
  <li class="empty">No books available.</li>
</ul>
```

### Conditional section with multiple content sources

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  <xsl:mode on-no-match="shallow-copy"/>

  <xsl:template match="/report">
    <report>
      <warnings>
        <xsl:apply-templates select="item[@severity='high']"/>
        <xsl:apply-templates select="item[@severity='critical']"/>
        <xsl:on-empty>
          <message>All clear — no warnings.</message>
        </xsl:on-empty>
      </warnings>
    </report>
  </xsl:template>

  <xsl:template match="item">
    <warning level="{@severity}"><xsl:value-of select="."/></warning>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `xsl:on-empty` looks only at nodes produced by preceding siblings in the *same* sequence constructor, not at the final result tree. Whitespace-only text nodes do count as content.
- It is safe to use in streaming mode because it works with already-processed content.
- Only one `xsl:on-empty` should appear per sequence constructor; having multiple is allowed but only the first may ever fire.
- Do not confuse with testing `count(nodes) = 0` — `xsl:on-empty` avoids needing a variable binding altogether.

## See also

- [xsl:on-non-empty](../xsl-on-non-empty)
- [xsl:where-populated](../xsl-where-populated)
