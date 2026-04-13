---
title: "XSLT string functions: complete reference with examples"
description: "Complete guide to XSLT and XPath string functions: substring, contains, replace, tokenize, normalize-space and more. With practical examples."
date: 2025-03-28T00:00:00Z
tags: ["xslt", "xpath", "strings", "functions"]
---

String manipulation is one of the most common tasks in XSLT. Whether you are formatting output, parsing codes, or normalising values from external systems, XPath provides a rich set of string functions. This reference covers the most useful ones with examples you can run in [XSLT Playground](https://xsltplayground.com).

## Basic string functions (XSLT 1.0+)

### string-length

Returns the number of characters in a string.

```xml
<xsl:value-of select="string-length('hello')"/>  <!-- 5 -->
<xsl:value-of select="string-length(title)"/>     <!-- length of title element text -->
```

### substring

Extracts a portion of a string. Arguments: string, start position (1-based), optional length.

```xml
<xsl:value-of select="substring('ABCDEF', 2, 3)"/>   <!-- BCD -->
<xsl:value-of select="substring('ABCDEF', 4)"/>       <!-- DEF -->
```

### substring-before and substring-after

Split a string on a delimiter.

```xml
<xsl:value-of select="substring-before('2024-11-28', '-')"/>  <!-- 2024 -->
<xsl:value-of select="substring-after('user@example.com', '@')"/>  <!-- example.com -->
```

### contains, starts-with, ends-with

Test membership without extracting.

```xml
<xsl:if test="contains(email, '@')">...</xsl:if>
<xsl:if test="starts-with(code, 'EUR')">...</xsl:if>
<!-- ends-with requires XSLT 2.0+ -->
<xsl:if test="ends-with(filename, '.xml')">...</xsl:if>
```

### concat

Joins strings together. Takes any number of arguments.

```xml
<xsl:value-of select="concat(firstname, ' ', lastname)"/>
<xsl:value-of select="concat('ID-', format-number(id, '0000'))"/>
```

### normalize-space

Strips leading and trailing whitespace, and collapses internal whitespace to single spaces. Essential for cleaning values from XML sources.

```xml
<xsl:value-of select="normalize-space(description)"/>
```

### translate

Replaces characters one-for-one. Useful for simple case conversion or character removal.

```xml
<!-- uppercase (XSLT 1.0 approach) -->
<xsl:value-of select="translate(name, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>

<!-- remove digits -->
<xsl:value-of select="translate(code, '0123456789', '')"/>
```

## Advanced string functions (XSLT 2.0+)

### upper-case and lower-case

No longer need `translate` for case conversion.

```xml
<xsl:value-of select="upper-case(name)"/>
<xsl:value-of select="lower-case(status)"/>
```

### replace

Regex-based substitution. Much more powerful than `translate`.

```xml
<!-- remove all non-digits -->
<xsl:value-of select="replace(phone, '[^0-9]', '')"/>

<!-- normalise whitespace to single space -->
<xsl:value-of select="replace(description, '\s+', ' ')"/>

<!-- mask last 4 digits of card number -->
<xsl:value-of select="replace(card, '\d(?=\d{4})', '*')"/>
```

### matches

Tests a string against a regex.

```xml
<xsl:if test="matches(email, '^[^@]+@[^@]+\.[^@]+$')">
  <!-- valid-looking email -->
</xsl:if>
```

### tokenize

Splits a string into a sequence using a regex delimiter. Returns a sequence of strings.

```xml
<!-- split CSV line -->
<xsl:for-each select="tokenize(csv-line, ',')">
  <item><xsl:value-of select="normalize-space(.)"/></item>
</xsl:for-each>

<!-- split on any whitespace -->
<xsl:variable name="words" select="tokenize(sentence, '\s+')"/>
<xsl:value-of select="count($words)"/> <!-- word count -->
```

### string-join

The inverse of `tokenize`. Joins a sequence with a separator.

```xml
<xsl:value-of select="string-join(//tag/text(), ', ')"/>
<!-- "xml, xslt, saxon" -->
```

### format-number

Formats a number as a string with a picture pattern.

```xml
<xsl:value-of select="format-number(1234567.89, '#,##0.00')"/>
<!-- 1,234,567.89 -->
<xsl:value-of select="format-number(0.175, '0.00%')"/>
<!-- 17.50% -->
```

### format-date and format-dateTime

Format xs:date and xs:dateTime values using picture strings.

```xml
<xsl:value-of select="format-date(xs:date('2024-11-28'), '[D01]/[M01]/[Y]')"/>
<!-- 28/11/2024 -->

<xsl:value-of select="format-dateTime(current-dateTime(), '[H01]:[m01]:[s01]')"/>
<!-- 14:35:22 -->
```

## Practical patterns

**Extract domain from URL:**
```xml
<xsl:variable name="after-proto" select="substring-after(url, '//')"/>
<xsl:value-of select="substring-before($after-proto, '/')"/>
```

**Pad a number with leading zeros:**
```xml
<xsl:value-of select="format-number(id, '000000')"/>
```

**Check if a node text is numeric:**
```xml
<xsl:if test="matches(normalize-space(amount), '^\d+(\.\d+)?$')">
```

All of these work in [XSLT Playground](https://xsltplayground.com). Set the version to 2.0 or 3.0 for the functions that require it.

