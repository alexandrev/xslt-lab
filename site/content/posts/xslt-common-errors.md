---
title: "XSLT error messages explained: the 17 most common Saxon errors and how to fix each one"
description: "A practical triage guide to XSLT and Saxon errors — XPST0017, XPTY0004, XPDY0002, 'Content is not allowed in prolog' and more: what each means and the fastest fix."
date: 2026-07-02T00:00:00Z
tags: ["xslt", "saxon", "errors", "debugging"]
---

**Quick answer:** most XSLT failures fall into three buckets. If the error code starts with **XP/XT + "S"** (XPST, XTSE) the *stylesheet itself* is invalid and nothing ran. If it starts with **XP/XT + "D"** (XPDY, XTDE) the stylesheet compiled but hit a problem *at runtime with your data*. If the message mentions the **XML parser** (SAXParseException, SXXP0003), your *input document* is not well-formed XML — the stylesheet never even got a chance. Find your exact error below.

## Triage: read the code before the message

| Prefix | Layer | Meaning |
|---|---|---|
| `XPST…` | XPath, static | Expression invalid — typo, unknown function/variable/prefix |
| `XPTY…` | XPath, type | Value has wrong type or cardinality (2.0+ strictness) |
| `XPDY…` | XPath, dynamic | Expression valid but failed on your data/context |
| `XTSE…` | XSLT, static | Stylesheet structure invalid |
| `XTDE…` / `XTRE…` | XSLT, dynamic | Runtime failure / recoverable condition |
| `FO…` | Function library | A standard function rejected its input |
| `SXXP0003` / SAXParseException | XML parser | Input is not well-formed XML |

## Stylesheet won't compile (static errors)

- **[XPST0017 — Cannot find a matching N-argument function](/xslt/errors/xpst0017/)** — unknown function or wrong arity; very often a 2.0/3.0 function running as XSLT 1.0.
- **[XPST0081 — Namespace prefix has not been declared](/xslt/errors/xpst0081/)** — the prefix must be declared in the *stylesheet*, not just the source.
- **[XPST0008 — Variable has not been declared](/xslt/errors/xpst0008/)** — usually a scope problem: the variable died with its enclosing block.
- **[XTSE0630 — Variable is multiply defined](/xslt/errors/xtse0630/)** — duplicate declaration, or the same module included twice.
- **[XTSE0010 — Element not allowed at this location](/xslt/errors/xtse0010/)** — wrong nesting: output markup at top level, xsl:otherwise before xsl:when, late xsl:param.

## Runs but fails on your data (dynamic & type errors)

- **[XPTY0004 — A sequence of more than one item is not allowed](/xslt/errors/xpty0004/)** — the #1 migration error from 1.0 to 2.0+: strict typing refuses multi-node sequences and mixed-type comparisons.
- **[XPDY0002 — The context item is absent](/xslt/errors/xpdy0002/)** — relative paths inside xsl:function or with no source document.
- **[XTDE1490 — Cannot write more than one result document to the same URI](/xslt/errors/xtde1490/)** — static href inside a loop; make it dynamic.
- **[XTMM9000 — Processing terminated by xsl:message](/xslt/errors/xtmm9000/)** — an intentional assertion fired; read the message text, not the code.
- **[XTRE0540 — Ambiguous rule match](/xslt/errors/xtre0540/)** — two templates match with equal priority; add priority or modes.

## Function library complaints

- **[FORX0002 — Invalid regular expression](/xslt/errors/forx0002/)** — XPath regex ≠ PCRE: no lookarounds, and double your braces inside xsl:analyze-string.
- **[FODC0002 — Error retrieving resource](/xslt/errors/fodc0002/)** — doc()/document() URI resolution; guard with doc-available().
- **[FORG0001 — Invalid value for cast](/xslt/errors/forg0001/)** — dirty data meeting xs:integer()/xs:date(); guard with castable as.

## Your input XML is broken (parser errors)

- **[SXXP0003 — Error reported by XML parser](/xslt/errors/sxxp0003/)** — Saxon's wrapper; the wrapped message is the real diagnosis.
- **[Content is not allowed in prolog](/xslt/errors/content-not-allowed-in-prolog/)** — BOM, stray bytes, or an HTML error page fed to the parser.
- **[The entity name must immediately follow the '&'](/xslt/errors/entity-name-must-immediately-follow/)** — a bare `&`; write `&amp;` (only 5 named entities exist in XML).
- **[Markup following the root element must be well-formed](/xslt/errors/markup-following-root-element/)** — two root elements; wrap the fragments.

## A 3-step debugging workflow

1. **Reproduce small.** Paste stylesheet + input into [XSLT Playground](https://xsltplayground.com/) and cut the input down to the smallest fragment that still fails — Saxon errors carry exact line numbers, so shrinking the case pinpoints the culprit.
2. **Check the layer** with the table above: fix stylesheet, data, or input well-formedness — they need different tools.
3. **Trace it.** For logic errors that don't raise codes at all (wrong output, empty output), enable the execution trace to see which templates fired and with what context. The [debugging patterns guide](/posts/xslt-debugging-patterns/) covers this in depth.

Browse the full **[XSLT & Saxon Error Reference](/xslt/errors/)** for every error above, each with before/after fixes you can run.
