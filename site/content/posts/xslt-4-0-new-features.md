---
title: "XSLT 4.0: what's new, with the 3.0 code you can run today"
description: "XSLT 4.0 explained with examples — xsl:switch, then/else on xsl:if, optional function parameters, xsl:array, separators — each next to a working XSLT 3.0 equivalent."
date: 2026-10-04T00:00:00Z
tags: ["xslt4", "xslt3", "xpath4", "saxon"]
keywords: ["xslt 4.0", "xslt 4.0 new features", "what's new in xslt 4.0", "xslt 4.0 examples", "xsl:switch"]
---

**Quick answer:** XSLT 4.0 is still a draft. The QT4 Community Group published its latest working draft on 29 September 2026, and it is explicitly "not stable or complete". The only processor that runs it today is **Saxon 13**, in the commercial **PE and EE** editions — and only once you switch 4.0 on; Saxonica says the features are "in most cases" not in the free Saxon-HE. So for production work you still write XSLT 3.0. But 4.0 is close enough to read, and most of its additions are things you already do in 3.0 with more typing. This post shows each one next to the 3.0 code that does the same job — and every 3.0 example below was run on Saxon-HE 12.9, the processor behind [XSLT Playground](https://xsltplayground.com/xslt-3-0/).

All 4.0 syntax here follows the 29 September 2026 draft. Saxon 13 implements the 28 January 2026 draft, so details can differ between the spec and what Saxon accepts. For where 4.0 runs and how to switch it on, see [Can you use XSLT 4.0 today?](https://xsltplayground.com/blog/posts/xslt-4-0-saxon-support/)

Snippets that use `{...}` inside text or attributes assume `expand-text="yes"` on the `xsl:stylesheet` element, as in the files they were tested from. The examples use this input:

```xml
<orders>
  <order id="A1" type="express" price="120" discount="20"/>
  <order id="A2" type="standard" price="40"/>
  <order id="A3" type="pickup" price="15"/>
  <order id="A4" type="overnight" price="90" discount="5"/>
</orders>
```

## xsl:switch — a real switch, finally

XSLT has never had a switch on a value. You wrote `xsl:choose` and repeated the expression in every `xsl:when`. 4.0 adds `xsl:switch`: the `select` is evaluated once, and each `xsl:when/@test` is compared with it using the `=` operator.

```xml
<!-- XSLT 4.0 -->
<xsl:switch select="string(@type)">
  <xsl:when test="'express', 'overnight'"><fast id="{@id}"/></xsl:when>
  <xsl:when test="'standard'"><normal id="{@id}"/></xsl:when>
  <xsl:otherwise><other id="{@id}"/></xsl:otherwise>
</xsl:switch>
```

Because the comparison is `=` and not `eq`, a `test` can list several values: the first `xsl:when` above is a two-value case.

The 3.0 version repeats the selector, but works today:

```xml
<!-- XSLT 3.0 -->
<xsl:variable name="type" select="string(@type)"/>
<xsl:choose>
  <xsl:when test="$type = ('express', 'overnight')"><fast id="{@id}"/></xsl:when>
  <xsl:when test="$type = 'standard'"><normal id="{@id}"/></xsl:when>
  <xsl:otherwise><other id="{@id}" type="{@type}"/></xsl:otherwise>
</xsl:choose>
```

Output on Saxon-HE 12.9:

```xml
<shipping>
   <fast id="A1"/>
   <normal id="A2"/>
   <other id="A3" type="pickup"/>
   <fast id="A4"/>
</shipping>
```

You do not have to wait for 4.0 to *write* `xsl:switch`, either: a 3.0 processor will run its `xsl:fallback`. That trick — and the trap that comes with it — is covered in [the processor-support post](https://xsltplayground.com/blog/posts/xslt-4-0-saxon-support/).

## then and else on xsl:if, select on xsl:when

`xsl:if` gains `then` and `else` attributes, and `xsl:when` / `xsl:otherwise` gain `select`. Small, but it removes a lot of nesting:

```xml
<!-- XSLT 4.0 -->
<xsl:if test="@price > 50" then="'large'" else="'small'"/>

<xsl:choose>
  <xsl:when test="@discount" select="@price - @discount"/>
  <xsl:otherwise select="@price"/>
</xsl:choose>
```

In 3.0 you get the same result with an XPath conditional:

```xml
<!-- XSLT 3.0 -->
<xsl:sequence select="if (@price > 50) then 'large' else 'small'"/>
```

One thing worth knowing whichever version you use: write `@price > 50`, not `@price gt 50`. Without a schema, attributes are untyped, and the value comparison `gt` refuses to compare an untyped value with a number — Saxon stops with *XPTY0004: Values are not comparable*. The general comparison `>` converts the attribute to a number first.

## Optional parameters on xsl:function

A stylesheet function parameter can now have a default value, and callers can name arguments:

```xml
<!-- XSLT 4.0 -->
<xsl:function name="f:price" as="xs:decimal">
  <xsl:param name="amount" as="xs:decimal"/>
  <xsl:param name="vat" as="xs:decimal" required="no" select="0.21"/>
  <xsl:sequence select="round($amount * (1 + $vat), 2)"/>
</xsl:function>

<xsl:value-of select="f:price(100), f:price(100, vat := 0.10)"/>
```

In 3.0 you get optional parameters by overloading on arity — one function per argument count, the shorter one supplying the default:

```xml
<!-- XSLT 3.0 -->
<xsl:function name="f:price" as="xs:decimal">
  <xsl:param name="amount" as="xs:decimal"/>
  <xsl:sequence select="f:price($amount, 0.21)"/>
</xsl:function>

<xsl:function name="f:price" as="xs:decimal">
  <xsl:param name="amount" as="xs:decimal"/>
  <xsl:param name="vat" as="xs:decimal"/>
  <xsl:sequence select="round($amount * (1 + $vat), 2)"/>
</xsl:function>
```

Both produce `121 | 110` for the two calls. The 3.0 pattern is fine for one optional parameter; with three it becomes four functions, which is where 4.0 earns its keep.

## xsl:array

3.0 has arrays, but no instruction to build one. 4.0 adds `xsl:array`, with a `for-each` attribute that makes one member per item:

```xml
<!-- XSLT 4.0 -->
<xsl:array for-each="order" select="string(@id)"/>
```

In 3.0, use the array constructor inside `select`:

```xml
<!-- XSLT 3.0 -->
<xsl:sequence select="array { order ! string(@id) }"/>
```

With `<xsl:output method="json"/>` that gives `[ "A1", "A2", "A3", "A4" ]`.

## A separator on xsl:for-each and xsl:apply-templates

Every XSLT developer has written the "comma unless it's the last one" test. 4.0 makes it an attribute (an attribute value template, so it can be computed):

```xml
<!-- XSLT 4.0 -->
<xsl:for-each select="order" separator=", ">{@id}</xsl:for-each>
```

```xml
<!-- XSLT 3.0 -->
<xsl:for-each select="order">
  <xsl:text>{@id}</xsl:text>
  <xsl:if test="position() ne last()">, </xsl:if>
</xsl:for-each>
```

Output: `A1, A2, A3, A4`. (When you only need a string, `xsl:value-of` with its `separator` attribute already does this in 3.0.)

## Maps keep their order

This one has no 3.0 workaround, and it bites anyone producing JSON. In 3.0, map entries come out in whatever order the processor likes. This 3.0 stylesheet builds `name` before `salary`:

```xml
<xsl:sequence select="map { 'name': 'Ana', 'salary': 52000 }"/>
```

and Saxon-HE 12.9 serialises it as `{"salary":52000,"name":"Ana"}`. In 4.0, **maps are ordered**: a map constructor keeps its entries in the order you wrote them, so the JSON comes out as written.

## Enclosing modes

A mode can now contain its own template rules, so everything that happens in that mode is in one place:

```xml
<!-- XSLT 4.0 -->
<xsl:mode name="summary">
  <xsl:template match="order">
    <line>{@id}: {@price}</line>
  </xsl:template>
  <xsl:template match="text()"/>
</xsl:mode>
```

The rules are strict: the mode must have a name, and the templates inside it need a `match` and no `name` or `mode`. In 3.0 you write the same templates at the top level with `mode="summary"` on each one.

## And the rest

The list of changes is long — the draft has well over a hundred change notes. A few more worth knowing:

- **`xsl:note`** — documentation that can go anywhere in a stylesheet and is ignored by the processor.
- **`xsl:select`** — an instruction whose content is an XPath expression, handy for long map constructors.
- **`split-when` and `merge-when`** on `xsl:for-each-group`, for groupings `group-adjacent` can't express.
- **Named item types and record types** (`xsl:item-type`, `xsl:record-type`), so you stop repeating long type signatures.
- **JNodes**: template rules that match inside parsed JSON the way they match XML elements. This is the headline feature of 4.0, and big enough for its own post.

Much of what makes 4.0 code shorter happens in XPath, not XSLT: `otherwise`, string templates, `fn { }` shorthand functions, keyword arguments, map literals without the `map` keyword. Those are in [XPath 4.0 new features](https://xsltplayground.com/blog/posts/xpath-4-0-new-features/). And 4.0 finally reads CSV natively — see [Parsing CSV in XSLT](https://xsltplayground.com/blog/posts/xslt-parse-csv/) for that, plus a 3.0 parser you can use now.

## Try the 3.0 versions

Every 3.0 example above runs as-is in the [XSLT 3.0 Online Tester](https://xsltplayground.com/xslt-3-0/) — paste the input, paste a snippet inside a `<xsl:template match="/orders">`, and run it on the same Saxon-HE 12.9 they were tested on. If you are new to 3.0 itself, [XSLT 3.0 new features](https://xsltplayground.com/blog/posts/xslt-3-new-features/) is the place to start: 4.0 builds directly on it.
