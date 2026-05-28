---
title: "xsl:result-document: generating multiple output files from one XSLT transform"
description: "How to use xsl:result-document in XSLT 2.0 and 3.0 to produce multiple output files from a single stylesheet. Covers split by category, multi-format output, serialization control, and streaming."
date: 2026-05-16T00:00:00Z
tags: ["xslt", "xslt2", "xslt3", "saxon"]
---

XSLT 1.0 has one rule about output: a transformation produces exactly one result tree. For many tasks that is fine, but it breaks down the moment you need to split a dataset into separate files, generate an HTML report alongside a machine-readable XML feed, or produce a batch of documents from a single source. XSLT 2.0 introduced `xsl:result-document` to solve this. XSLT 3.0 keeps it and adds streaming support.

## Basic syntax

`xsl:result-document` writes its content tree to a URI you specify. The `href` attribute determines where the output goes relative to the base output URI of the transform.

```xml
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <!-- primary output -->
    <summary>
      <xsl:value-of select="count(//item)"/> items processed
    </summary>

    <!-- secondary output -->
    <xsl:result-document href="details.xml" method="xml" indent="yes">
      <details>
        <xsl:copy-of select="//item"/>
      </details>
    </xsl:result-document>
  </xsl:template>

</xsl:stylesheet>
```

The content inside `xsl:result-document` is serialized to `details.xml`. Everything outside it goes to the primary result. The two outputs are independent: different serialization settings, different structure, different file.

## Use case 1: split by category

A common integration task is partitioning a flat list into separate files, one per category value. Given this input:

```xml
<products>
  <product id="p1" category="electronics">
    <name>Wireless Headphones</name>
    <price>89.99</price>
  </product>
  <product id="p2" category="books">
    <name>XSLT 2.0 and XPath 2.0</name>
    <price>45.00</price>
  </product>
  <product id="p3" category="electronics">
    <name>USB-C Hub</name>
    <price>34.50</price>
  </product>
  <product id="p4" category="books">
    <name>XQuery Kick Start</name>
    <price>38.00</price>
  </product>
</products>
```

This stylesheet produces one file per distinct category:

```xml
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="products">
    <!-- primary output: index of generated files -->
    <index>
      <xsl:for-each select="distinct-values(product/@category)">
        <xsl:sort select="."/>
        <file category="{.}" href="{.}.xml"/>
      </xsl:for-each>
    </index>

    <!-- one result-document per category -->
    <xsl:for-each select="distinct-values(product/@category)">
      <xsl:variable name="cat" select="."/>
      <xsl:result-document href="{$cat}.xml" method="xml" indent="yes">
        <products category="{$cat}">
          <xsl:copy-of select="/products/product[@category = $cat]"/>
        </products>
      </xsl:result-document>
    </xsl:for-each>
  </xsl:template>

</xsl:stylesheet>
```

The primary output is an index listing the generated files. Two secondary files are written: `electronics.xml` and `books.xml`, each containing only the matching products. `distinct-values()` is an XPath 2.0 function — this stylesheet requires XSLT 2.0 or later. Try it at [xsltplayground.com/xslt-2-0/](https://xsltplayground.com/xslt-2-0/).

## Use case 2: multiple formats from one pass

The same source document can produce an HTML report and a CSV data file in a single run:

```xml
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="yes"/>

  <xsl:template match="products">
    <!-- primary output: HTML report -->
    <html>
      <body>
        <h1>Product Catalogue</h1>
        <table>
          <tr><th>ID</th><th>Category</th><th>Name</th><th>Price</th></tr>
          <xsl:for-each select="product">
            <tr>
              <td><xsl:value-of select="@id"/></td>
              <td><xsl:value-of select="@category"/></td>
              <td><xsl:value-of select="name"/></td>
              <td><xsl:value-of select="price"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>

    <!-- secondary output: CSV -->
    <xsl:result-document href="products.csv" method="text">
      <xsl:text>id,category,name,price&#10;</xsl:text>
      <xsl:for-each select="product">
        <xsl:value-of select="@id"/><xsl:text>,</xsl:text>
        <xsl:value-of select="@category"/><xsl:text>,</xsl:text>
        <xsl:value-of select="name"/><xsl:text>,</xsl:text>
        <xsl:value-of select="price"/>
        <xsl:text>&#10;</xsl:text>
      </xsl:for-each>
    </xsl:result-document>
  </xsl:template>

</xsl:stylesheet>
```

Each `xsl:result-document` has its own `method` attribute that overrides the top-level `xsl:output` for that document only.

## Controlling serialization with method and format

The `method` attribute on `xsl:result-document` accepts `xml`, `html`, `text`, and — in XSLT 3.0 — `json`. You can also reference a named output declaration using the `format` attribute:

```xml
<xsl:output name="csv-format" method="text" encoding="UTF-8"/>
<xsl:output name="xml-format" method="xml" indent="yes" encoding="UTF-8"/>

<xsl:result-document href="data.csv" format="csv-format">
  ...
</xsl:result-document>

<xsl:result-document href="data.xml" format="xml-format">
  ...
</xsl:result-document>
```

Named output declarations keep serialization settings in one place and make the intent clear when you have many secondary documents. Any attribute valid on `xsl:output` — `encoding`, `indent`, `omit-xml-declaration`, `doctype-public`, `doctype-system` — can appear on `xsl:result-document` directly as well.

## XSLT 3.0: combining with streaming

In XSLT 3.0, `xsl:result-document` works with streaming. This is significant for large files: you can stream through a multi-gigabyte XML and write each chunk to a separate output file without ever holding the full document in memory.

```xml
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:mode name="split" streamable="yes"/>

  <xsl:template match="products" mode="split">
    <xsl:for-each-group select="product" group-by="@category">
      <xsl:result-document href="{current-grouping-key()}.xml" method="xml" indent="yes">
        <products category="{current-grouping-key()}">
          <xsl:copy-of select="current-group()"/>
        </products>
      </xsl:result-document>
    </xsl:for-each-group>
  </xsl:template>

</xsl:stylesheet>
```

Not all patterns are streamable — Saxon enforces this at compile time. The key constraint is that streaming templates cannot re-read a node after advancing past it, which rules out backward axes and some aggregations. For forward-only splits, streaming combined with `xsl:result-document` is efficient. Try this pattern at [xsltplayground.com/xslt-3-0/](https://xsltplayground.com/xslt-3-0/).

## Common limitations

**URI resolution**: the `href` value is resolved against the base output URI of the transform. If you pass a relative path like `output/electronics.xml`, the processor writes it relative to where the primary output is going. In some server-side pipelines, the base URI is not a writable filesystem path — check your runtime's documentation.

**Online tools**: most browser-based XSLT playgrounds only capture the primary result tree and discard secondary documents. When you run the category-split example in a tool that does not support `xsl:result-document`, you will see only the primary output and no error — the secondary files are simply not shown. This is the most common source of confusion when testing these stylesheets online.

XSLT Playground supports `xsl:result-document` and displays each output document separately, so you can verify the content of every generated file directly in the editor.

## Try the examples

Paste the category-split or multi-format stylesheets into the [XSLT 2.0 Online Tester](https://xsltplayground.com/xslt-2-0/) to see all generated documents side by side. For the streaming variant, switch to the [XSLT 3.0 Online Tester](https://xsltplayground.com/xslt-3-0/). Saxon HE is included in both — no install required.
