---
title: "xsl:catch"
description: "Handles dynamic errors thrown inside an xsl:try block, with access to error code, description, and value for precise recovery logic."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "element"
syntax: '<xsl:catch errors="error-codes">...</xsl:catch>'
tags: ["xslt", "reference", "xslt3"]
---

## Description

`xsl:catch` is the error-handler sibling of `xsl:try`. When a dynamic error occurs inside the try boundary, the processor evaluates the first `xsl:catch` whose `errors` pattern matches the error code. If no `errors` attribute is present, the catch block matches all errors — equivalent to a catch-all.

Inside an `xsl:catch` block, six special variables are automatically in scope, all in the `http://www.w3.org/2005/xqt-errors` namespace (conventionally bound to the prefix `err:`):

- `$err:code` — the QName of the error (e.g. `err:FODT0001`).
- `$err:description` — a human-readable string describing the error.
- `$err:value` — the value associated with the error, if any; otherwise the empty sequence.
- `$err:module` — the URI of the stylesheet module where the error occurred.
- `$err:line-number` — the line number, as an `xs:integer`, if available.
- `$err:column-number` — the column number, if available.

You can use these to log structured diagnostics, branch on specific error codes, or re-raise the error using `error($err:code, $err:description, $err:value)`.

Multiple `xsl:catch` elements may follow a single `xsl:try`; the processor uses the first that matches. A catch-all `xsl:catch` (no `errors` attribute) should therefore be placed last.

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `errors` | error-name-list | No | Space-separated list of error QNames or namespace wildcards (e.g. `Q{http://www.w3.org/2005/xqt-errors}*`). Omit to catch all errors. |

## Examples

### Multiple catch blocks with error-specific handling

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<operations>
  <op a="10" b="0" type="divide"/>
  <op a="hello" b="5" type="add"/>
  <op a="10" b="2" type="divide"/>
</operations>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:err="http://www.w3.org/2005/xqt-errors">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/operations">
    <results>
      <xsl:for-each select="op">
        <result>
          <xsl:try>
            <xsl:choose>
              <xsl:when test="@type='divide'">
                <xsl:value-of select="xs:integer(@a) idiv xs:integer(@b)"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="xs:integer(@a) + xs:integer(@b)"/>
              </xsl:otherwise>
            </xsl:choose>
            <xsl:catch errors="err:FOAR0001 err:FOAR0002">
              <xsl:text>Division by zero</xsl:text>
            </xsl:catch>
            <xsl:catch errors="err:FORG0001">
              <xsl:text>Type error: </xsl:text>
              <xsl:value-of select="$err:description"/>
            </xsl:catch>
            <xsl:catch>
              <xsl:text>Unexpected error: </xsl:text>
              <xsl:value-of select="$err:code"/>
            </xsl:catch>
          </xsl:try>
        </result>
      </xsl:for-each>
    </results>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<results>
  <result>Division by zero</result>
  <result>Type error: Invalid integer value 'hello'</result>
  <result>5</result>
</results>
```

### Logging errors to the output

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:err="http://www.w3.org/2005/xqt-errors">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <log>
      <xsl:try>
        <xsl:value-of select="doc('missing.xml')//title"/>
        <xsl:catch>
          <error>
            <code><xsl:value-of select="$err:code"/></code>
            <message><xsl:value-of select="$err:description"/></message>
          </error>
        </xsl:catch>
      </xsl:try>
    </log>
  </xsl:template>
</xsl:stylesheet>
```

## Notes

- `xsl:catch` must be a direct child of `xsl:try`. It cannot appear standalone.
- The `errors` attribute accepts namespace wildcards using the `Q{uri}*` syntax to catch all errors in a namespace.
- Re-raising an error: use `error($err:code, $err:description, $err:value)` inside the catch block.
- The error variables are only in scope within the `xsl:catch` content, not in `xsl:try` or other siblings.

## See also

- [xsl:try](../xsl-try)
