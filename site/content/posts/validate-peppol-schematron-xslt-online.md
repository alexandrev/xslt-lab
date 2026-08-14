---
title: "Validate Peppol / EN 16931 invoices online: how Schematron becomes XSLT"
description: "Peppol and EN 16931 validation is Schematron compiled to XSLT 2.0 stylesheets that emit SVRL. How the multi-layer pipeline works, how to run a compiled rule against a UBL invoice in the browser, and where an online playground honestly fits."
date: 2026-08-14T00:00:00Z
tags: ["xslt", "schematron", "peppol", "en16931", "validation", "svrl"]
---

**Quick answer:** Peppol BIS and EN 16931 invoice validation is not magic — it is **Schematron rules compiled into XSLT 2.0 stylesheets** that read your UBL invoice and emit an SVRL report listing every failed assertion. Because the official artefacts require an **XSLT 2.0 processor** (Saxon-class), you cannot run them in a browser (browsers only ever had 1.0 — and are [removing even that](https://xsltplayground.com/blog/posts/chrome-removing-xslt-what-to-do/)). You *can* run them in [XSLT Playground](https://xsltplayground.com/), which executes real Saxon HE server-side: paste the compiled XSLT as the stylesheet, the invoice as the input, and read the SVRL.

## The validation pipeline, demystified

A Peppol invoice passes through **layered** validation, each layer catching a different class of problem:

| Layer | Artefact | Catches |
|---|---|---|
| 1. Structure | **XSD** (UBL 2.1 Invoice schema) | Wrong elements, wrong order, wrong types |
| 2. Semantics (EU) | **Schematron: EN 16931** (`EN16931-UBL-validation.xsl`) | Business rules `BR-*`: totals must add up, VAT category consistency, code lists |
| 3. Semantics (Peppol) | **Schematron: Peppol BIS 3.0** (`PEPPOL-EN16931-UBL.xsl`) | Rules `PEPPOL-EN16931-R*`: Peppol-specific tightenings on top of the EN |

Layers 2 and 3 are authored as Schematron (`.sch`), but what actually *executes* is the **compiled XSLT** the projects ship alongside. The compilation is mechanical: each `sch:rule` becomes a template, each `sch:assert` becomes a test that, when it fails, writes an `svrl:failed-assert` element into the output. The output format, **SVRL** (Schematron Validation Report Language), is itself just XML — which is why the whole stack is "XSLT in, XSLT out".

Key operational fact: the official EN 16931 and Peppol artefacts use XPath 2.0 constructs throughout, so they **require an XSLT 2.0 processor** — in practice Saxon. This is exactly why every Peppol validator you have ever used runs server-side Java.

## Run a Schematron-compiled XSLT online

You would not paste the full 5 MB official artefacts into a browser tab. But for **understanding the mechanics** — and for debugging *one* rule — a minimal hand-compiled Schematron is perfect. This toy stylesheet checks two invoice rules and emits genuine SVRL; the second rule mimics the real `PEPPOL-EN16931-R003` ("A buyer reference or purchase order reference MUST be provided").

Input — a deliberately incomplete UBL invoice (no `cbc:BuyerReference`):

```xml
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>INV-2026-001</cbc:ID>
  <cbc:IssueDate>2026-08-01</cbc:IssueDate>
</Invoice>
```

Stylesheet — structured the way real compiled Schematron is (run with **version 2.0**):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                xmlns:ubl="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
                xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
                version="2.0">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <svrl:schematron-output title="Toy Peppol subset">
      <svrl:active-pattern name="invoice-rules"/>
      <xsl:apply-templates select="ubl:Invoice" mode="check"/>
    </svrl:schematron-output>
  </xsl:template>

  <xsl:template match="ubl:Invoice" mode="check">
    <svrl:fired-rule context="ubl:Invoice"/>
    <xsl:if test="not(cbc:IssueDate)">
      <svrl:failed-assert id="TOY-R001" flag="fatal" test="cbc:IssueDate">
        <svrl:text>An invoice MUST have an invoice issue date (BT-2).</svrl:text>
      </svrl:failed-assert>
    </xsl:if>
    <xsl:if test="not(cbc:BuyerReference)">
      <svrl:failed-assert id="TOY-R003" flag="fatal" test="cbc:BuyerReference">
        <svrl:text>A buyer reference MUST be provided (mimics PEPPOL-EN16931-R003).</svrl:text>
      </svrl:failed-assert>
    </xsl:if>
  </xsl:template>
</xsl:stylesheet>
```

Output — the SVRL report, exactly as Saxon returns it:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svrl:schematron-output xmlns:svrl="http://purl.oclc.org/dsdl/svrl"
                        xmlns:ubl="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
                        xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
                        title="Toy Peppol subset">
   <svrl:active-pattern name="invoice-rules"/>
   <svrl:fired-rule context="ubl:Invoice"/>
   <svrl:failed-assert id="TOY-R003" flag="fatal" test="cbc:BuyerReference">
      <svrl:text>A buyer reference MUST be provided (mimics PEPPOL-EN16931-R003).</svrl:text>
   </svrl:failed-assert>
</svrl:schematron-output>
```

Read it like a validator does: `fired-rule` says the context matched, the *absence* of a `failed-assert` for TOY-R001 means the issue-date check passed, and TOY-R003 flags the missing buyer reference. Add `<cbc:BuyerReference>PO-4711</cbc:BuyerReference>` to the input and re-run — the report drops to `fired-rule` only. That instant edit-rerun loop is the point.

## Where this is genuinely useful — and where it is not

**Useful for:**

- **Understanding why a rule fires.** Extract the one rule tormenting you from the official artefact into a minimal stylesheet like the above, shrink the invoice, iterate. Namespaces are the #1 gotcha — UBL's default namespace plus `cbc:`/`cac:` trips XPath constantly ([XPST0081 explained](https://xsltplayground.com/blog/posts/xslt-common-errors/)).
- **Developing your own Schematron.** If you write company-specific rules on top of Peppol, testing the compiled XSLT interactively beats a full pipeline round-trip every save.
- **Learning SVRL** before you write code that parses it.

**Not a replacement for:**

- **Official validation.** For compliance sign-off, run the complete artefact set with the OpenPeppol tooling or an accredited validator — full XSD layer, complete rule sets, correct artefact release versions. An online playground is a debugging microscope, not a conformance authority.

## Related

Schematron-to-XSLT is one of two places finance teams meet XSLT in 2026 — the other is [bank statement processing under ISO 20022](https://xsltplayground.com/blog/posts/iso-20022-xslt-transformations/), where camt.053 files get reshaped with the same XSLT 2.0 toolbox. For general rule-debugging technique, see the [debugging patterns guide](https://xsltplayground.com/blog/posts/xslt-debugging-patterns/).

Paste your compiled rule and an invoice at **[xsltplayground.com](https://xsltplayground.com/)** — version 2.0, run, read the SVRL.
