---
title: "generate-id()"
description: "Returns a unique string identifier for a node, guaranteed to be a valid XML name and stable within a single transformation run."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "node function"
syntax: "generate-id(node?)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`generate-id()` returns a string that uniquely identifies a node within the current transformation. The string is guaranteed to:

- Be a valid XML `Name` (it can be used as an attribute value or part of an ID).
- Be unique: different nodes in the same transformation produce different IDs.
- Be consistent: calling `generate-id()` on the same node multiple times within one transformation always returns the same string.

The generated value is arbitrary and processor-specific. It may change between runs or between different XSLT processors; do not store it in output that must be reproducible.

When called with no argument, `generate-id()` uses the context node. If the argument is an empty node-set, the empty string `""` is returned.

Common uses include generating `id`/`href` pairs for internal cross-references in HTML output, implementing the Muenchian grouping technique, and creating unique element names when converting to formats that require them.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `node` | node-set | No | The node to identify. Defaults to the context node. If empty, returns `""`. |

## Return value

`xs:string` — a unique, valid XML Name for the node, or `""` for an empty node-set.

## Examples

### Generate anchor links in HTML output

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sections>
  <section><title>Introduction</title><p>Welcome.</p></section>
  <section><title>Usage</title><p>How to use it.</p></section>
</sections>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/sections">
    <html><body>
      <!-- Table of contents -->
      <ul>
        <xsl:for-each select="section">
          <li><a href="#{generate-id()}"><xsl:value-of select="title"/></a></li>
        </xsl:for-each>
      </ul>
      <!-- Content -->
      <xsl:for-each select="section">
        <h2 id="{generate-id()}"><xsl:value-of select="title"/></h2>
        <p><xsl:value-of select="p"/></p>
      </xsl:for-each>
    </body></html>
  </xsl:template>
</xsl:stylesheet>
```

**Output (IDs are processor-generated):**
```html
<html><body>
  <ul>
    <li><a href="#d0e2">Introduction</a></li>
    <li><a href="#d0e7">Usage</a></li>
  </ul>
  <h2 id="d0e2">Introduction</h2>
  <p>Welcome.</p>
  <h2 id="d0e7">Usage</h2>
  <p>How to use it.</p>
</body></html>
```

### Muenchian grouping — test node identity

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<items>
  <item cat="A">One</item>
  <item cat="B">Two</item>
  <item cat="A">Three</item>
</items>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  <xsl:key name="by-cat" match="item" use="@cat"/>

  <xsl:template match="/items">
    <groups>
      <xsl:for-each select="item[generate-id() = generate-id(key('by-cat', @cat)[1])]">
        <group cat="{@cat}">
          <xsl:value-of select="count(key('by-cat', @cat))"/> items
        </group>
      </xsl:for-each>
    </groups>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<groups>
  <group cat="A">2 items</group>
  <group cat="B">1 items</group>
</groups>
```

## Notes

- The generated ID is **not persistent**: it may differ between processors and between runs of the same processor. Do not use it as a stable key in output databases or cross-document references.
- `generate-id()` on an empty node-set returns `""`, not an error. Check for this case if the argument might be empty.
- Two calls to `generate-id()` on the same node within one transformation always return the same value, which is the property that makes the Muenchian grouping technique work.
- In XSLT 2.0+, `generate-id()` remains available and unchanged. The `xsl:for-each-group` instruction is usually a cleaner alternative for grouping tasks.

## See also

- [id()](../xpath-id)
- [key()](../xpath-key)
