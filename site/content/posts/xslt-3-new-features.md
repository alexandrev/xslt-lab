---
title: "XSLT 3.0 new features: what changed from 2.0"
description: "A practical guide to XSLT 3.0 features including streaming, maps, arrays, and JSON support. What to adopt and why."
date: 2025-02-10T00:00:00Z
tags: ["xslt3", "saxon", "xslt2"]
---

XSLT 3.0 is a significant step beyond 2.0. If you are running Saxon on the backend — as XSLT Playground does — you have access to the full 3.0 feature set today. This post covers the additions that matter most in practice and shows how to try each one directly in the playground.

## Streaming

The most impactful change in 3.0 is streaming. In earlier versions, the processor loads the entire source document into memory before any template can run. With 3.0 streaming, selected templates can consume the document as a stream, which drastically reduces memory usage for large inputs.

To enable streaming, declare it on the stylesheet and on the mode:

```xml
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:mode streamable="yes"/>

  <xsl:template match="/">
    <xsl:apply-templates/>
  </xsl:template>

</xsl:stylesheet>
```

Not every expression is streamable. Saxon will tell you at compile time if a pattern is not compatible. The key restriction is that you can only visit each node once — no backward axes, no variables that hold nodes for later inspection.

## Maps and arrays

XSLT 3.0 adds maps and arrays as first-class values, borrowed from XPath 3.1. A map is a collection of key-value pairs; an array is an ordered sequence that can hold any value including other maps or arrays.

```xml
<xsl:variable name="config" select="map{
  'currency': 'EUR',
  'precision': 2,
  'separator': ','
}"/>

<xsl:value-of select="$config('currency')"/>
```

Arrays work similarly:

```xml
<xsl:variable name="codes" select="['US', 'GB', 'DE']"/>
<xsl:value-of select="$codes(1)"/>
```

Arrays use 1-based indexing. Use `array:size()`, `array:get()`, and `array:append()` from the array namespace for common operations.

## JSON input and output

XSLT 3.0 can parse and produce JSON natively via `json-to-xml()` and `xml-to-json()`. This eliminates the need for a pre-processing step when your source is JSON.

```xml
<xsl:variable name="parsed" select="json-to-xml($json-string)"/>
```

The function converts JSON into a predictable XML representation defined by the W3C. Objects become `<map>` elements, arrays become `<array>`, and primitives become typed `<string>`, `<number>`, or `<boolean>` elements. You transform this intermediate XML normally and then serialize it back with `xml-to-json()` if needed.

## Higher-order functions

You can now pass functions as arguments using `xsl:function` and the `function()` type. This enables patterns like map, filter, and fold over sequences without recursion.

```xml
<xsl:function name="my:double" as="xs:integer">
  <xsl:param name="n" as="xs:integer"/>
  <xsl:sequence select="$n * 2"/>
</xsl:function>

<xsl:variable name="doubled" select="for-each((1,2,3,4), my:double#1)"/>
```

The `#1` notation creates a function reference with arity 1.

## Packages

XSLT 3.0 introduces packages, which let you split a large stylesheet into independently compiled units that expose explicit interfaces. This is the equivalent of modules or libraries in other languages.

```xml
<xsl:package name="http://example.com/utils" version="1.0">
  <xsl:expose component="function" names="my:format-date" visibility="public"/>
  ...
</xsl:package>
```

Packages reduce coupling and enable reuse across projects without copy-paste.

## Try it in XSLT Playground

All the examples above run in [XSLT Playground](https://xsltplayground.com) with version set to 3.0. Maps and JSON support are the quickest to explore. Paste the `json-to-xml()` example, provide a JSON string as input, and see the intermediate representation immediately.

XSLT 3.0 is available today. If your integration still targets 2.0, the features above are the best reasons to upgrade.
