---
title: "Can you use XSLT 4.0 today? Processor support in 2026"
description: "Which processors run XSLT 4.0, how to enable it in Saxon 13, why Saxon-HE can't — and how to write 4.0 code now that still runs on any XSLT 3.0 processor."
date: 2026-10-04T00:00:00Z
tags: ["xslt4", "saxon", "xslt3", "xpath4"]
keywords: ["xslt 4.0 saxon", "xslt 4.0 support", "xslt 4.0 processor", "saxon 13 xslt 4.0", "can i use xslt 4.0"]
---

**Quick answer:** only one processor runs XSLT 4.0 today — **Saxon 13**, released in May 2026 — and only its commercial editions, **Saxon-PE and Saxon-EE**. The free **Saxon-HE**, in Saxonica's words, "in most cases" does not include them. The specification itself is still a **Community Group draft** that "should not be considered either stable or complete". So: use 4.0 for experiments and prototypes on PE/EE, keep production on 3.0 — and if you want to start writing 4.0 constructs now, there is a way to do it that degrades safely on 3.0 processors, with one trap you need to know about.

## Where the specification stands

XSLT 4.0, XPath 4.0 and the 4.0 function library are written by the QT4 Community Group at the W3C (qt4cg.org). As of this writing, the latest drafts are dated **29 September 2026**. Each one states that it is a working draft maintained by a Community Group, "work in progress", and not to be considered stable or complete. It is **not a W3C Recommendation**, and no date has been announced for one.

In practice that means the language can still change, and it does: each draft lists its changes. One example from the current draft — unpacking a map in a `let` (`let ${ $h, $w } := $rect`) was changed to use the lookup operator, so naming a field that a record type doesn't have is now a type error. When you read about a 4.0 feature, check the date of the draft it describes.

## Saxon 13

Saxonica released Saxon 13 in May 2026, for Java, .NET, C/C++, PHP and Python. Its 4.0 support:

- **More than 175 features** from the 4.0 drafts, including JNodes for navigating parsed JSON, CSV parsing functions, Invisible XML parsing, and lookahead and lookbehind in regular expressions.
- It targets the drafts dated **28 January 2026** — not the September ones. Expect small differences between what Saxon 13 accepts and what the newest draft says.
- **Saxon-PE and Saxon-EE.** The documentation is explicit: "The use of new 4.0 features requires Saxon-PE or Saxon-EE", and "in most cases they are not available in Saxon-HE". Treat Saxon-HE 13 as an XSLT 3.0 processor.

4.0 features are **off by default**, "because the features in the 4.0 specifications cannot be considered stable". Note what turns them on — it is **not** the `version` attribute. You enable them on the processor:

```bash
# on the command line
java net.sf.saxon.Transform -xsltversion:4.0 -s:input.xml -xsl:style.xsl
```

```java
// from Java (s9api)
xsltCompiler.setXsltLanguageVersion("4.0");
```

(or with the `ALLOW_SYNTAX_EXTENSIONS` configuration property, which also enables Saxon's own extensions). Saxonica still recommends declaring `version="4.0"` on the `xsl:stylesheet` of any module that uses 4.0 syntax — "if only for good documentation". Declaring it without enabling 4.0 on the processor gets you the forwards-compatible behaviour described below, not 4.0.

## Everything else

XSLT 3.0 support was never widespread outside Saxon, and 4.0 follows the same pattern: as of October 2026 we know of no other processor that implements it. Browsers still ship XSLT 1.0 — and Chrome is removing even that ([what to do about it](https://xsltplayground.com/blog/posts/chrome-removing-xslt-what-to-do/)). The libxslt, Xalan and .NET `XslCompiledTransform` engines are XSLT 1.0. If you need 4.0 features, you need Saxon 13 PE or EE.

## Writing 4.0 now: xsl:fallback works

XSLT has a rule for exactly this situation: **forwards-compatible processing**. When a processor sees a stylesheet whose `version` is higher than the one it implements, it doesn't reject instructions it doesn't know. It runs their `xsl:fallback` child instead.

So you can write `xsl:switch` today, with a 3.0 fallback inside it:

```xml
<xsl:stylesheet version="4.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" expand-text="yes">
  <xsl:template match="/orders">
    <shipping>
      <xsl:for-each select="order">
        <xsl:switch select="string(@type)">
          <xsl:when test="'express', 'overnight'"><fast id="{@id}"/></xsl:when>
          <xsl:when test="'standard'"><normal id="{@id}"/></xsl:when>
          <xsl:otherwise><other id="{@id}"/></xsl:otherwise>
          <!-- ignored by a 4.0 processor; run by a 3.0 one -->
          <xsl:fallback>
            <xsl:choose>
              <xsl:when test="@type = ('express', 'overnight')"><fast id="{@id}"/></xsl:when>
              <xsl:when test="@type = 'standard'"><normal id="{@id}"/></xsl:when>
              <xsl:otherwise><other id="{@id}"/></xsl:otherwise>
            </xsl:choose>
          </xsl:fallback>
        </xsl:switch>
      </xsl:for-each>
    </shipping>
  </xsl:template>
</xsl:stylesheet>
```

We ran this on **Saxon-HE 12.9**, a 3.0 processor. It compiles, runs the fallback, and produces the right output. On Saxon 13 PE/EE with 4.0 enabled (`-xsltversion:4.0`), the `xsl:switch` takes over and the fallback is ignored. The 4.0 specification describes `xsl:fallback` inside `xsl:switch` for exactly this purpose.

## The trap: new *attributes* are silently ignored

Fallback only protects new **instructions**. 4.0 also adds new **attributes** to existing instructions — `then` and `else` on `xsl:if`, `separator` on `xsl:for-each`, `select` on `xsl:when` — and forwards-compatible mode handles an unknown attribute by **ignoring it**.

This 4.0 stylesheet:

```xml
<xsl:stylesheet version="4.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>
  <xsl:template match="/orders">
    <xsl:for-each select="order">
      <xsl:text>[</xsl:text>
      <xsl:if test="@price > 50" then="'large'" else="'small'"/>
      <xsl:text>]</xsl:text>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
```

should print `[large][small][small][large]`. On Saxon-HE 12.9 it prints `[][][][]`. Saxon does warn — *XTSE0090: Attribute xsl:if/@then is ignored in forwards compatibility mode* — but it is only a warning: the transformation succeeds and returns the wrong result. In a pipeline where nobody reads the warnings, that is a silent bug.

The rule of thumb: **a new 4.0 instruction with an `xsl:fallback` is safe on a 3.0 processor; a new 4.0 attribute is not.** Until you run on a 4.0 processor everywhere, keep the new attributes out of stylesheets that a 3.0 processor might execute.

## What we recommend

- **Production:** XSLT 3.0. It is a W3C Recommendation, Saxon-HE runs all of it for free, and most of 4.0's conveniences have a 3.0 equivalent — see [XSLT 4.0: what's new](https://xsltplayground.com/blog/posts/xslt-4-0-new-features/) and [XPath 4.0 new features](https://xsltplayground.com/blog/posts/xpath-4-0-new-features/) for each one side by side.
- **Exploring 4.0:** Saxon 13 PE or EE with `-xsltversion:4.0`, and `version="4.0"` on the stylesheet. Keep it out of anything you can't easily change, since the draft is still moving.
- **Mixed estates:** new 4.0 instructions only with an `xsl:fallback`, and no new attributes.

## And XSLT Playground?

[XSLT Playground](https://xsltplayground.com/) runs Saxon-HE 12.9 — XSLT 1.0, 2.0 and 3.0. It can't run 4.0 features, but both examples on this page work there exactly as described: the `xsl:switch` stylesheet through its fallback, and the `xsl:if` one showing the silent trap. Paste either into the [XSLT 3.0 Online Tester](https://xsltplayground.com/xslt-3-0/) with this input:

```xml
<orders>
  <order id="A1" type="express" price="120"/>
  <order id="A2" type="standard" price="40"/>
  <order id="A3" type="pickup" price="15"/>
  <order id="A4" type="overnight" price="90"/>
</orders>
```
