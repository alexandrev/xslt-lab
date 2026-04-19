---
title: "replace()"
description: "Replaces all substrings of a string that match a regular expression with a replacement string."
date: 2026-04-18T00:00:00Z
version: "2.0"
versionLabel: "XSLT 2.0"
category: "string function"
syntax: "replace(string, pattern, replacement, flags?)"
tags: ["xslt", "reference", "xslt2", "xpath"]
tryUrl: "https://xsltplayground.com/?xslt=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHhzbDpzdHlsZXNoZWV0IHZlcnNpb249IjIuMCIgeG1sbnM6eHNsPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L1hTTC9UcmFuc2Zvcm0iPgogIDx4c2w6b3V0cHV0IG1ldGhvZD0ieG1sIiBpbmRlbnQ9InllcyIvPgoKICA8eHNsOnRlbXBsYXRlIG1hdGNoPSIvcHJpY2VzIj4KICAgIDxudW1iZXJzPgogICAgICA8eHNsOmZvci1lYWNoIHNlbGVjdD0icHJpY2UiPgogICAgICAgIDwhLS0gUmVtb3ZlICQgYW5kIGNvbW1hIHRvIGdldCBhIHBsYWluIG51bWJlciAtLT4KICAgICAgICA8bnVtYmVyPjx4c2w6dmFsdWUtb2Ygc2VsZWN0PSJyZXBsYWNlKC4sICdbXCQsXScsICcnKSIvPjwvbnVtYmVyPgogICAgICA8L3hzbDpmb3ItZWFjaD4KICAgIDwvbnVtYmVycz4KICA8L3hzbDp0ZW1wbGF0ZT4KPC94c2w6c3R5bGVzaGVldD4&xml=PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHByaWNlcz4KICA8cHJpY2U-JDEsMjk5LjAwPC9wcmljZT4KICA8cHJpY2U-JDg0OS41MDwvcHJpY2U-CjwvcHJpY2VzPg&version=2.0"
---

## Description

`replace()` searches the input string for all occurrences of the regular expression `pattern` and substitutes each match with the `replacement` string. Unlike `translate()` (which works character-by-character), `replace()` operates on substrings and patterns, making it suitable for complex string transformations.

The `replacement` string may include **back-references** to captured groups using `$1`, `$2`, etc., where `$0` refers to the entire matched substring. Dollar signs that are not back-references must be escaped as `\$`.

The function uses XPath regex syntax (a subset of XML Schema regex), which is similar to Java/Perl regex but does not support lookaheads or backreferences in the pattern itself.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string | Yes | The input string to perform replacements on. |
| `pattern` | xs:string | Yes | Regular expression pattern matching the substrings to replace. |
| `replacement` | xs:string | Yes | Replacement string; may use `$0`, `$1`, etc. for captured groups. |
| `flags` | xs:string | No | Regex flags: `i` (case-insensitive), `m` (multiline), `s` (dot-all), `x` (extended). |

## Return value

`xs:string` — the input string with all matches of `pattern` replaced by `replacement`.

## Examples

### Remove unwanted characters

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<prices>
  <price>$1,299.00</price>
  <price>$849.50</price>
</prices>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/prices">
    <numbers>
      <xsl:for-each select="price">
        <!-- Remove $ and comma to get a plain number -->
        <number><xsl:value-of select="replace(., '[\$,]', '')"/></number>
      </xsl:for-each>
    </numbers>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<numbers>
  <number>1299.00</number>
  <number>849.50</number>
</numbers>
```

### Reformat a date using back-references

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<events>
  <event date="2026-04-18">Conference</event>
  <event date="2026-05-01">Workshop</event>
</events>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/events">
    <events>
      <xsl:for-each select="event">
        <!-- Reformat YYYY-MM-DD to DD/MM/YYYY -->
        <event date="{replace(@date, '^(\d{{4}})-(\d{{2}})-(\d{{2}})$', '$3/$2/$1')}">
          <xsl:value-of select="."/>
        </event>
      </xsl:for-each>
    </events>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<events>
  <event date="18/04/2026">Conference</event>
  <event date="01/05/2026">Workshop</event>
</events>
```

*Note: curly braces inside attribute value templates must be doubled: `{{` and `}}`.*

### Collapse multiple spaces

```xml
<xsl:value-of select="replace(normalize-space(description), '\s+', ' ')"/>
```

## Notes

- `replace()` replaces **all** occurrences, not just the first. There is no `replaceFirst()` equivalent in XPath.
- To escape a literal `$` in the replacement string, write `\$`.
- The pattern cannot match an empty string; if the pattern can match zero characters Saxon raises a dynamic error.
- For simple character substitution, `translate()` (XSLT 1.0) is simpler and more efficient. Use `replace()` when you need pattern matching or back-references.
- Inside attribute value templates, curly braces within the regex (e.g., `\d{4}`) must be doubled: `\d{{4}}`.

## See also

- [matches()](../xpath-matches)
- [tokenize()](../xpath-tokenize)
