---
title: "function-name()"
description: "Returns the QName of a named function item, or the empty sequence if the function is anonymous."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "higher-order function"
syntax: "function-name(function)"
tags: ["xslt", "reference", "xpath", "xslt3"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjMuMCIKICB4bWxuczp4c2w9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvWFNML1RyYW5zZm9ybSIKICB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiCiAgeG1sbnM6Zj0iaHR0cDovL2V4YW1wbGUuY29tL2ZuIj4KCiAgPHhzbDpvdXRwdXQgbWV0aG9kPSJ4bWwiIGluZGVudD0ieWVzIi8-CgogIDx4c2w6ZnVuY3Rpb24gbmFtZT0iZjpkb3VibGUiIGFzPSJ4czppbnRlZ2VyIj4KICAgIDx4c2w6cGFyYW0gbmFtZT0ieCIgYXM9InhzOmludGVnZXIiLz4KICAgIDx4c2w6c2VxdWVuY2Ugc2VsZWN0PSIkeCAqIDIiLz4KICA8L3hzbDpmdW5jdGlvbj4KCiAgPHhzbDp0ZW1wbGF0ZSBtYXRjaD0iLyI-CiAgICA8cmVzdWx0PgogICAgICA8bmFtZWQ-CiAgICAgICAgPHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImZ1bmN0aW9uLW5hbWUoZjpkb3VibGUjMSkiLz4KICAgICAgPC9uYW1lZD4KICAgICAgPGFub255bW91cz4KICAgICAgICA8eHNsOnZhcmlhYmxlIG5hbWU9ImZuIiBzZWxlY3Q9ImZ1bmN0aW9uKCR4KSB7ICR4ICogMiB9Ii8-CiAgICAgICAgPHhzbDp2YWx1ZS1vZiBzZWxlY3Q9IihmdW5jdGlvbi1uYW1lKCRmbiksICdhbm9ueW1vdXMnKVsxXSIvPgogICAgICA8L2Fub255bW91cz4KICAgICAgPGJ1aWx0aW4-CiAgICAgICAgPHhzbDp2YWx1ZS1vZiBzZWxlY3Q9ImZ1bmN0aW9uLW5hbWUodXBwZXItY2FzZSMxKSIvPgogICAgICA8L2J1aWx0aW4-CiAgICA8L3Jlc3VsdD4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHJvb3QvPg&version=3.0"
---

## Description

`function-name()` inspects a function item and returns its QName if the function has a name. For anonymous inline functions (created with `function(...)` expressions), it returns the empty sequence. This is useful for logging, debugging, and dynamic function inspection.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `function` | function(*) | Yes | The function item to inspect. |

## Return value

`xs:QName?` — the QName of the function, or the empty sequence for anonymous functions.

## Examples

### Inspecting named and anonymous functions

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:f="http://example.com/fn">

  <xsl:output method="xml" indent="yes"/>

  <xsl:function name="f:double" as="xs:integer">
    <xsl:param name="x" as="xs:integer"/>
    <xsl:sequence select="$x * 2"/>
  </xsl:function>

  <xsl:template match="/">
    <result>
      <named>
        <xsl:value-of select="function-name(f:double#1)"/>
      </named>
      <anonymous>
        <xsl:variable name="fn" select="function($x) { $x * 2 }"/>
        <xsl:value-of select="(function-name($fn), 'anonymous')[1]"/>
      </anonymous>
      <builtin>
        <xsl:value-of select="function-name(upper-case#1)"/>
      </builtin>
    </result>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<result>
  <named>f:double</named>
  <anonymous>anonymous</anonymous>
  <builtin>fn:upper-case</builtin>
</result>
```

### Logging function calls in a dispatch table

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="fns" select="(upper-case#1, lower-case#1, normalize-space#1)"/>
    <log>
      <xsl:for-each select="$fns">
        <entry>
          <name><xsl:value-of select="function-name(.)"/></name>
          <arity><xsl:value-of select="function-arity(.)"/></arity>
        </entry>
      </xsl:for-each>
    </log>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<log>
  <entry><name>fn:upper-case</name><arity>1</arity></entry>
  <entry><name>fn:lower-case</name><arity>1</arity></entry>
  <entry><name>fn:normalize-space</name><arity>1</arity></entry>
</log>
```

## Notes

- Anonymous functions created with inline `function(...)` syntax return the empty sequence.
- For built-in functions, the local name is the function name without the `fn:` prefix, but `function-name()` returns the fully expanded QName.
- Use `local-name-from-QName()` and `namespace-uri-from-QName()` to decompose the returned QName.

## See also

- [function-arity()](../xpath-function-arity)
- [function-lookup()](../xpath-function-lookup)
- [apply()](../xpath-apply)
