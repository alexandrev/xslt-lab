---
title: "xsl:try"
description: "Evaluates an XPath expression or sequence constructor and catches any dynamic errors, enabling graceful error handling in XSLT 3.0."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: '<xsl:try select="expression"><xsl:catch .../></xsl:try>'
tags: ["xslt", "reference", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvZXZlbnRzIj4KICAgIDxyZXN1bHRzPgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0iZXZlbnQiPgogICAgICAgIDxpdGVtIG5hbWU9InsufSI-CiAgICAgICAgICA8eHNsOnRyeSBzZWxlY3Q9ImZvcm1hdC1kYXRlKHhzOmRhdGUoQGRhdGUpLCAnW0RdIFtNTm5dIFtZXScpIj4KICAgICAgICAgICAgPHhzbDpjYXRjaD4KICAgICAgICAgICAgICA8eHNsOnRleHQ-SW52YWxpZCBkYXRlPC94c2w6dGV4dD4KICAgICAgICAgICAgPC94c2w6Y2F0Y2g-CiAgICAgICAgICA8L3hzbDp0cnk-CiAgICAgICAgPC9pdGVtPgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwvcmVzdWx0cz4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGV2ZW50cz4KICA8ZXZlbnQgZGF0ZT0iMjAyNi0wMy0xNSI-Q29uZmVyZW5jZTwvZXZlbnQ-CiAgPGV2ZW50IGRhdGU9Im5vdC1hLWRhdGUiPldvcmtzaG9wPC9ldmVudD4KICA8ZXZlbnQgZGF0ZT0iMjAyNi0wNC0wMSI-V2ViaW5hcjwvZXZlbnQ-CjwvZXZlbnRzPg&version=3.0"
---

## Description

`xsl:try` is the XSLT 3.0 mechanism for catching dynamic errors that occur during transformation. Before XSLT 3.0, any error in an XPath expression or instruction aborted the entire transformation. With `xsl:try` you can isolate a risky operation, catch the error with a paired `xsl:catch` block, and either recover gracefully or emit a meaningful error message.

`xsl:try` works in two modes. In *expression mode*, you set the `select` attribute to an XPath expression whose value is returned if it succeeds. In *instruction mode*, you use a sequence constructor as the content of the element. Either way, if a dynamic error occurs within the try boundary, control transfers to the first matching `xsl:catch` sibling.

Common use cases include: calling extension functions that may fail, parsing user-supplied data that might be malformed, accessing documents that might not exist (`doc()` on an unknown URI), and converting strings to typed values where the cast may raise an error.

`xsl:try` does not catch static errors or type errors detected at compile time — only dynamic errors raised during evaluation.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `select` | expression | No | XPath expression to evaluate. Mutually exclusive with content. |

## Examples

### Safely parsing a date attribute

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<events>
  <event date="2026-03-15">Conference</event>
  <event date="not-a-date">Workshop</event>
  <event date="2026-04-01">Webinar</event>
</events>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/events">
    <results>
      <xsl:for-each select="event">
        <item name="{.}">
          <xsl:try select="format-date(xs:date(@date), '[D] [MNn] [Y]')">
            <xsl:catch>
              <xsl:text>Invalid date</xsl:text>
            </xsl:catch>
          </xsl:try>
        </item>
      </xsl:for-each>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <item name="Conference">15 March 2026</item>
  <item name="Workshop">Invalid date</item>
  <item name="Webinar">1 April 2026</item>
</results>
```

### Loading an optional document

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:err="http://www.w3.org/2005/xqt-errors">
  <xsl:output method="xml" indent="yes"/>

  <xsl:param name="config-uri" select="'config.xml'"/>

  <xsl:template match="/">
    <xsl:try>
      <xsl:variable name="config" select="doc($config-uri)"/>
      <output source="{$config-uri}">
        <xsl:value-of select="$config//setting[@name='theme']/@value"/>
      </output>
      <xsl:catch errors="err:FODC0002 err:FODC0005">
        <!-- Document not found or not well-formed -->
        <output source="default">light</output>
      </xsl:catch>
    </xsl:try>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- Every `xsl:try` must contain at least one `xsl:catch` as a direct child. Other content may appear alongside `xsl:catch`.
- Variables declared inside `xsl:try` are not in scope in `xsl:catch`.
- `xsl:try` is not streamable; it cannot be used inside a streaming template.
- Inside `xsl:catch`, special variables `$err:code`, `$err:description`, `$err:value`, `$err:module`, `$err:line-number`, and `$err:column-number` are available.

## See also

- [xsl:catch](../xsl-catch)
