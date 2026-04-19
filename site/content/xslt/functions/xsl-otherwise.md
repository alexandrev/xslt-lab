---
title: "xsl:otherwise"
description: "Default fallback branch inside xsl:choose, instantiated when no xsl:when condition evaluates to true."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "element"
syntax: '<xsl:otherwise>'
tags: ["xslt", "reference", "xslt1"]
---

## Description

`xsl:otherwise` is the optional final child of `xsl:choose` and acts as the default branch — the fallback when none of the preceding `xsl:when` conditions matched. Its content is instantiated exactly when all sibling `xsl:when` tests evaluate to false.

If `xsl:otherwise` is absent and no `xsl:when` matches, the `xsl:choose` element produces no output and raises no error. Adding `xsl:otherwise` is therefore a defensive practice: it lets you handle unexpected values explicitly rather than silently producing empty output.

An `xsl:choose` may contain at most one `xsl:otherwise`, and it must appear after all `xsl:when` siblings. It takes no attributes.

## Attributes

`xsl:otherwise` has no attributes. Its entire behavior is expressed through its content.

## Examples

### Unknown value handling

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<events>
  <event type="click">Button pressed</event>
  <event type="focus">Input focused</event>
  <event type="custom">Something else</event>
</events>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/events">
    <log>
      <xsl:apply-templates select="event"/>
    </log>
  </xsl:template>

  <xsl:template match="event">
    <entry>
      <xsl:choose>
        <xsl:when test="@type = 'click'">
          <type>user-action</type>
        </xsl:when>
        <xsl:when test="@type = 'focus'">
          <type>ui-event</type>
        </xsl:when>
        <xsl:otherwise>
          <type>unknown</type>
          <raw-type><xsl:value-of select="@type"/></raw-type>
        </xsl:otherwise>
      </xsl:choose>
      <message><xsl:value-of select="."/></message>
    </entry>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<log>
  <entry><type>user-action</type><message>Button pressed</message></entry>
  <entry><type>ui-event</type><message>Input focused</message></entry>
  <entry><type>unknown</type><raw-type>custom</raw-type><message>Something else</message></entry>
</log>
```

### Error signaling with xsl:message

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<config><mode>production</mode></config>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>

  <xsl:template match="/config">
    <xsl:choose>
      <xsl:when test="mode = 'production'">PROD</xsl:when>
      <xsl:when test="mode = 'staging'">STG</xsl:when>
      <xsl:when test="mode = 'development'">DEV</xsl:when>
      <xsl:otherwise>
        <xsl:message terminate="yes">
          <xsl:text>Unknown mode: </xsl:text>
          <xsl:value-of select="mode"/>
        </xsl:message>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```
PROD
```

## Notes

- Placing `xsl:otherwise` before any `xsl:when` is a schema validation error and most processors will reject it.
- An `xsl:otherwise` with no content is valid and simply produces no output — this can be used intentionally to suppress output for unrecognised values without raising an error.
- `xsl:otherwise` has no test attribute; if you need a final condition rather than an unconditional default, add another `xsl:when` before it.

## See also

- [xsl:choose](../xsl-choose)
- [xsl:when](../xsl-when)
- [xsl:if](../xsl-if)
