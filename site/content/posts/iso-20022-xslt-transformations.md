---
title: "ISO 20022 and XSLT: transforming camt.053 bank statements after the MT sunset"
description: "SWIFT retired MT940/942/101 in November 2025, and ISO 20022 is XML — which is why payments teams are writing XSLT in 2026. A runnable camt.053-to-CSV example in XSLT 2.0, plus trace-based debugging tips."
date: 2026-08-14T00:00:00Z
tags: ["xslt", "iso20022", "camt053", "payments", "sap", "csv"]
---

**Quick answer:** ISO 20022 messages (camt, pain, pacs) are XML, and since **SWIFT stopped supporting the legacy MT formats (MT940/942/101) in November 2025**, every system that consumed MT text files needs the XML equivalents instead. The pragmatic bridge is XSLT: transform camt.053 statements into whatever your ERP, treasury system or reconciliation job expects. In SAP environments this is explicit — importing camt.052/053/054 electronic bank statements runs through XSLT transformations. Below: a realistic, runnable camt.053-to-CSV stylesheet in XSLT 2.0.

## Why payments teams are writing XSLT in 2026

The MT940 era was fixed-format text: line-oriented, position-sensitive, parsed with regex and prayer. Its camt successors are deeply nested XML with a versioned namespace per message (`urn:iso:std:iso:20022:tech:xsd:camt.053.001.02` and later revisions). That swap broke every downstream consumer that expected MT text — and created three recurring transformation jobs:

- **camt → flat/CSV** for reconciliation engines, data warehouses and anything that still thinks in rows (this post's example).
- **camt → camt** to bridge version gaps — your bank sends `camt.053.001.08`, your ERP's importer was certified against `.02`.
- **MT-lookalike output** for legacy systems that cannot be changed, generated *from* camt so the old interface survives the sunset.

XSLT is the natural tool: the input is XML, the mappings are declarative, and the same stylesheet runs identically in SAP PI/PO, MuleSoft, Tibco, or a cron job with Saxon. Use **XSLT 2.0** — `xs:decimal` arithmetic, `string-join`, and `format-number` do in one line what 1.0 needed recursive templates for.

## Runnable example: camt.053 entries to CSV

A minimal but structurally faithful camt.053: two booked entries (one credit, one direct-debit) under `BkToCstmrStmt/Stmt/Ntry`.

Input XML:

```xml
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Id>STMT-2026-0812</Id>
      <Ntry>
        <Amt Ccy="EUR">1250.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt><Dt>2026-08-11</Dt></BookgDt>
        <ValDt><Dt>2026-08-11</Dt></ValDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>INVOICE 2026-448</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
      <Ntry>
        <Amt Ccy="EUR">89.90</Amt>
        <CdtDbtInd>DBIT</CdtDbtInd>
        <BookgDt><Dt>2026-08-12</Dt></BookgDt>
        <ValDt><Dt>2026-08-12</Dt></ValDt>
        <NtryDtls>
          <TxDtls>
            <RmtInf><Ustrd>SEPA DD TELECOM AUG</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>
```

Stylesheet (run with **version 2.0**). Note the two traps it handles: camt puts everything in a **default namespace** you must bind to a prefix, and amounts are unsigned — the sign lives in `CdtDbtInd`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:camt="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02"
                exclude-result-prefixes="camt xs"
                version="2.0">
  <xsl:output method="text"/>

  <xsl:template match="/">
    <xsl:text>booking_date,value_date,amount,currency,reference&#10;</xsl:text>
    <xsl:for-each select="camt:Document/camt:BkToCstmrStmt/camt:Stmt/camt:Ntry">
      <xsl:variable name="sign" select="if (camt:CdtDbtInd = 'DBIT') then -1 else 1"/>
      <xsl:value-of select="string-join((
        camt:BookgDt/camt:Dt,
        camt:ValDt/camt:Dt,
        format-number($sign * xs:decimal(camt:Amt), '0.00'),
        camt:Amt/@Ccy,
        camt:NtryDtls/camt:TxDtls/camt:RmtInf/camt:Ustrd
      ), ',')"/>
      <xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
```

Output (exactly as returned):

```
booking_date,value_date,amount,currency,reference
2026-08-11,2026-08-11,1250.00,EUR,INVOICE 2026-448
2026-08-12,2026-08-12,-89.90,EUR,SEPA DD TELECOM AUG
```

Production notes: real files carry multiple `TxDtls` per entry (batch bookings) — decide whether to explode them into rows or aggregate; `RmtInf` may be `Strd` (structured) instead of `Ustrd`; and if fields can contain commas, wrap them in quotes before joining. For richer target formats, the [XML-to-JSON/CSV guide](https://xsltplayground.com/blog/posts/xslt-xml-to-json-csv/) covers the variations.

## Debugging camt stylesheets with trace

Symptoms and their causes, in order of how often they actually happen:

1. **Empty output, no error.** Almost always the namespace: `select="Document/BkToCstmrStmt"` silently matches nothing because the elements live in the camt namespace. Bind the prefix and qualify *every* step. In [XSLT Playground](https://xsltplayground.com/), enable the **trace** — if your `for-each` selected zero nodes you see it immediately, instead of staring at a blank result.
2. **Works on the sample, fails on the bank's file.** Usually a namespace *version* mismatch — the stylesheet says `.001.02`, the bank upgraded to `.001.08`. The prefix binding must match the file byte-for-byte.
3. **`FORG0001` on the amount cast.** Some entry has an empty or non-numeric `Amt` in an edge case; guard with `castable as xs:decimal`. The [Saxon error reference](https://xsltplayground.com/blog/posts/xslt-common-errors/) maps the rest.

General technique — shrink the statement to the one failing `Ntry` and iterate — is covered in the [debugging patterns guide](https://xsltplayground.com/blog/posts/xslt-debugging-patterns/).

## Related

camt processing is one of two finance workloads keeping XSLT busy in 2026; the other is e-invoicing, where [Peppol/EN 16931 validation runs as Schematron compiled to XSLT 2.0](https://xsltplayground.com/blog/posts/validate-peppol-schematron-xslt-online/) — same processor class, same debugging workflow. And with [browsers dropping XSLT](https://xsltplayground.com/blog/posts/chrome-removing-xslt-what-to-do/), server-side Saxon is unambiguously where this work lives.

Paste your camt file and stylesheet at **[xsltplayground.com](https://xsltplayground.com/)** — version 2.0, run, and use the trace when the output is not what the bank promised.
