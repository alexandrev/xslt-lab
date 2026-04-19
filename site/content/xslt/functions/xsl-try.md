---
title: "xsl:try"
description: "Evaluates an XPath expression or sequence constructor and catches any dynamic errors, enabling graceful error handling in XSLT 3.0."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: '<xsl:try select="expression"><xsl:catch .../></xsl:try>'
tags: ["xslt", "reference", "xslt3"]
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
