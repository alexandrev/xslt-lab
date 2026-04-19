---
title: "array:insert-before()"
description: "Returns a new array with the given members inserted before the specified 1-based position."
date: 2026-04-19T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "array function"
syntax: "array:insert-before(array, position, members)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`array:insert-before()` returns a new array formed by inserting one or more new members into the input array just before the specified position. The `position` argument is 1-based. Inserting before position 1 prepends to the array; inserting before `array:size($array) + 1` appends to the array.

The `members` argument is treated as a sequence of new array members to insert, each becoming a separate member of the result array. This means the result array's size is `array:size(array) + count(members-sequence)`.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | array(*) | Yes | The source array. |
| `position` | xs:integer | Yes | The 1-based position before which to insert. |
| `members` | item()* | Yes | The sequence of new members to insert. Each item in the sequence becomes a separate array member. |

## Return value

`array(*)` — a new array with the inserted members, larger than the original.

## Examples

### Inserting at the beginning

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:variable name="a" select="['B', 'C', 'D']"/>
    <xsl:variable name="result" select="array:insert-before($a, 1, 'A')"/>
    <xsl:value-of select="array:flatten($result)" separator=" "/>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
A B C D
```

### Inserting in the middle

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data/>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:array="http://www.w3.org/2005/xpath-functions/array">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/data">
    <xsl:variable name="a" select="[1, 2, 5, 6]"/>
    <!-- Insert 3 and 4 before position 3 -->
    <xsl:variable name="result" select="array:insert-before($a, 3, (3, 4))"/>
    <array>
      <xsl:for-each select="1 to array:size($result)">
        <item><xsl:value-of select="array:get($result, .)"/></item>
      </xsl:for-each>
    </array>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<array>
  <item>1</item>
  <item>2</item>
  <item>3</item>
  <item>4</item>
  <item>5</item>
  <item>6</item>
</array>
```

## Notes

- Inserting before position `array:size($array) + 1` is equivalent to appending; use `array:append()` for clarity.
- The `members` argument is a sequence; each item in the sequence becomes a separate array member. To insert a single member that is itself a sequence, wrap it in an array and use `array:join()`.
- Positions outside the range 1 to `size + 1` raise a dynamic error.
- The source array is not modified; `array:insert-before()` always returns a new array.

## See also

- [array:remove()](../xpath-array-remove)
- [array:append()](../xpath-array-append)
- [array:flatten()](../xpath-array-flatten)
- [array:size()](../xpath-array-size)
