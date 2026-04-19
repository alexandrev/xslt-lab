---
title: "matches()"
description: "Tests whether a string matches a regular expression, returning true or false."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "string function"
syntax: "matches(string, pattern, flags?)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvZW50cmllcyI-CiAgICA8dmFsaWRhdGVkPgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0iZW50cnkiPgogICAgICAgIDxlbnRyeSB2YWxpZD0ie2lmIChtYXRjaGVzKEBpZCwgJ15bQS1aXS1cZHt7M319JCcpLCAndHJ1ZScsICdmYWxzZScpfSI-CiAgICAgICAgICA8eHNsOnZhbHVlLW9mIHNlbGVjdD0iLiIvPgogICAgICAgIDwvZW50cnk-CiAgICAgIDwveHNsOmZvci1lYWNoPgogICAgPC92YWxpZGF0ZWQ-CiAgPC94c2w6dGVtcGxhdGU-CjwveHNsOnN0eWxlc2hlZXQ-&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPGVudHJpZXM-CiAgPGVudHJ5IGlkPSJBLTAwMSI-VmFsaWQgZW50cnk8L2VudHJ5PgogIDxlbnRyeSBpZD0iQjEyMyI-SW52YWxpZCBmb3JtYXQ8L2VudHJ5PgogIDxlbnRyeSBpZD0iQy0wNDIiPkFub3RoZXIgdmFsaWQ8L2VudHJ5Pgo8L2VudHJpZXM-&version=2.0"
---

## Description

`matches()` tests whether the input `string` matches the regular expression `pattern` and returns `true` or `false`. By default the entire string does not need to match — the pattern is matched anywhere within the string (like a "contains" regex test). To anchor the match to the full string, use `^` and `$` anchors in the pattern.

The optional `flags` argument controls matching behaviour:

| Flag | Meaning |
|------|---------|
| `i` | Case-insensitive matching. |
| `m` | Multiline mode: `^` and `$` match at line boundaries. |
| `s` | Dot-all mode: `.` matches any character including newline. |
| `x` | Extended mode: whitespace and `#` comments are ignored in the pattern. |

`matches()` uses XML Schema / XPath regex syntax, which is similar to but not identical to Perl/PCRE regex. Notably, lookaheads and backreferences are not supported.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string | Yes | The string to test. |
| `pattern` | xs:string | Yes | The regular expression pattern. |
| `flags` | xs:string | No | One or more flag characters controlling match behaviour. |

## Return value

`xs:boolean` — `true` if the pattern matches anywhere in the string (unless anchored), `false` otherwise.

## Examples

### Validate a format

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<entries>
  <entry id="A-001">Valid entry</entry>
  <entry id="B123">Invalid format</entry>
  <entry id="C-042">Another valid</entry>
</entries>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/entries">
    <validated>
      <xsl:for-each select="entry">
        <entry valid="{if (matches(@id, '^[A-Z]-\d{{3}}$'), 'true', 'false')}">
          <xsl:value-of select="."/>
        </entry>
      </xsl:for-each>
    </validated>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<validated>
  <entry valid="true">Valid entry</entry>
  <entry valid="false">Invalid format</entry>
  <entry valid="true">Another valid</entry>
</validated>
```

*Note: inside attribute value templates, `{` and `}` must be doubled: `{{` and `}}`.*

### Case-insensitive search

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/entries">
    <matches>
      <xsl:for-each select="entry[matches(., 'valid', 'i')]">
        <item><xsl:value-of select="."/></item>
      </xsl:for-each>
    </matches>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<matches>
  <item>Valid entry</item>
  <item>Invalid format</item>
  <item>Another valid</item>
</matches>
```

### Filter with a pattern predicate

```xml
<!-- Select only elements whose text is a valid email-like pattern -->
<xsl:for-each select="contact[matches(email, '^[^@]+@[^@]+\.[^@]+$')]">
```

## Notes

- `matches()` is case-sensitive by default. Use the `i` flag for case-insensitive matching.
- The regex is anchored only with `^` / `$` — without them, a partial match anywhere in the string returns `true`.
- XPath regex does not support all PCRE features. Lookahead (`?=`), lookbehind (`?<=`), and named groups are not available.
- In XSLT 1.0, there is no built-in regex support. The only alternative is complex template recursion or extension functions.

## See also

- [replace()](../xpath-replace)
- [tokenize()](../xpath-tokenize)
- [contains()](../xpath-contains)
