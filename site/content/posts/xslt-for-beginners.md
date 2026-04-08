---
title: "XSLT for beginners: your first transformation"
description: "Learn XSLT from scratch with practical examples. Transform XML step by step using templates, match patterns, and value-of."
date: 2025-02-20T00:00:00Z
tags: ["beginners", "xslt", "tutorial"]
---

XSLT is a language for transforming XML documents into other formats — another XML structure, HTML, plain text, or JSON. If you are new to it, the learning curve can feel steep because XSLT is declarative and template-driven, which is different from procedural languages. This guide walks you through the core ideas with working examples you can run in [XSLT Playground](https://xsltplayground.com) right now.

## What XSLT does

You start with an XML source document. You write a stylesheet that describes rules for transforming it. The processor reads both and produces an output document. The stylesheet does not loop through the input line by line — instead, it defines templates that match nodes, and the processor calls those templates as it traverses the document tree.

## Your first stylesheet

Start with a simple XML document:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="b1">
    <title>Design Patterns</title>
    <author>Gang of Four</author>
    <price>45.00</price>
  </book>
  <book id="b2">
    <title>Clean Code</title>
    <author>Robert Martin</author>
    <price>38.00</price>
  </book>
</catalog>
```

Now write a stylesheet that turns this into an HTML table:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="yes"/>

  <xsl:template match="/">
    <html>
      <body>
        <table border="1">
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Price</th>
          </tr>
          <xsl:apply-templates select="catalog/book"/>
        </table>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="book">
    <tr>
      <td><xsl:value-of select="title"/></td>
      <td><xsl:value-of select="author"/></td>
      <td><xsl:value-of select="price"/></td>
    </tr>
  </xsl:template>

</xsl:stylesheet>
```

Paste both into [XSLT Playground](https://xsltplayground.com) and run it. You will see an HTML table with the book data.

## Understanding templates

The `<xsl:template match="/">` rule fires when the processor reaches the document root. Inside it, `<xsl:apply-templates select="catalog/book"/>` tells the processor to find all `book` elements inside `catalog` and call the matching template for each one.

The second template `<xsl:template match="book">` fires once per `book` element. Inside it, `<xsl:value-of select="title"/>` extracts the text content of the `title` child.

This is the core loop of XSLT: match, apply, select.

## XPath selects nodes

The `select` and `match` attributes use XPath, a path language for navigating XML trees. A few rules you will use constantly:

| XPath | Meaning |
|---|---|
| `catalog/book` | `book` children of `catalog` |
| `//book` | All `book` elements anywhere in the document |
| `book/@id` | The `id` attribute of `book` |
| `book[price > 40]` | Books whose price exceeds 40 |
| `.` | The current node |
| `..` | The parent of the current node |

## Filtering with predicates

Add a predicate to the `apply-templates` call to show only books over 40:

```xml
<xsl:apply-templates select="catalog/book[price > 40]"/>
```

Or use `xsl:if` inside the template:

```xml
<xsl:template match="book">
  <xsl:if test="price > 40">
    <tr>
      <td><xsl:value-of select="title"/></td>
    </tr>
  </xsl:if>
</xsl:template>
```

## Sorting output

Use `xsl:sort` to control the order:

```xml
<xsl:apply-templates select="catalog/book">
  <xsl:sort select="price" data-type="number" order="ascending"/>
</xsl:apply-templates>
```

## What to try next

Once you are comfortable with templates and XPath:

- Learn `xsl:for-each` for inline iteration
- Explore `xsl:choose` for multi-branch conditionals
- Try `xsl:variable` to store intermediate values
- Look at `xsl:param` to pass values into your stylesheet from outside

All of these work in XSLT 1.0, 2.0, and 3.0. The [XSLT Playground](https://xsltplayground.com) lets you set the version and experiment without installing anything.
