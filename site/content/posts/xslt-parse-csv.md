---
title: "Parsing CSV in XSLT: a robust 3.0 solution today, parse-csv() in 4.0"
description: "How to read CSV in XSLT 3.0 without breaking on quoted commas, escaped quotes or line breaks — a tested stylesheet — and how XSLT 4.0 replaces it with one call."
date: 2026-10-04T00:00:00Z
tags: ["xslt3", "xslt4", "csv", "integration"]
keywords: ["xslt parse csv", "csv to xml xslt", "xslt csv", "parse-csv", "csv-to-xml", "xslt 4.0"]
---

**Quick answer:** XSLT 3.0 has no CSV parser, but it has everything you need to write a correct one — `unparsed-text()` to read the file, `xsl:analyze-string` to split it, and `xsl:for-each-group` to rebuild the rows. The stylesheet below handles the cases that break naive approaches (commas inside quotes, doubled quotes, line breaks inside a field, Windows line endings) and was tested on Saxon-HE 12.9. XSLT 4.0 makes all of it a single function call: `csv-to-xml($text, { 'header': true() })`. That is in the current draft, and runs today only on Saxon 13 PE/EE.

## Why splitting on commas isn't enough

The obvious approach is `tokenize($line, ',')` on each line. It works until the data contains this — which real exports always eventually do:

```text
id,name,city,note
1,Ana,Madrid,
2,"Cole, Ben",Berlin,"said ""hi"""
3,Chloe,"New
York",multi-line city
```

Row 2 has a comma inside a quoted field and a quote escaped by doubling it (`""`). Row 3 has a line break inside a quoted field, so it isn't even one line. Splitting by lines and then by commas gets all three wrong. The rules are in RFC 4180: a field may be quoted; inside quotes, commas and line breaks are data and `""` stands for `"`.

## A CSV parser in XSLT 3.0

The idea: scan the whole text with one regular expression that matches *a field followed by its delimiter*. A field is either a quoted string — `"(?:[^"]|"")*"` — or a run of characters with no comma, quote or newline. The delimiter is a comma (the row continues) or a newline (the row ends). Then group the fields into rows.

```xml
<xsl:stylesheet version="3.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:csv="urn:example:csv"
    exclude-result-prefixes="#all">

  <xsl:output indent="yes"/>

  <!-- In the playground, paste your CSV into this parameter -->
  <xsl:param name="csv" as="xs:string">id,name,city,note
1,Ana,Madrid,
2,"Cole, Ben",Berlin,"said ""hi"""
3,Chloe,"New
York",multi-line city</xsl:param>

  <!-- Splits CSV text into rows of fields (RFC 4180: quoted fields may contain
       commas, doubled quotes and line breaks). Every match ends in a delimiter,
       so the regex never matches an empty string. -->
  <xsl:function name="csv:rows" as="element(row)*">
    <xsl:param name="text" as="xs:string"/>
    <xsl:variable name="lf" select="replace($text, '\r\n?', '&#10;')"/>
    <xsl:variable name="normalized" select="if (ends-with($lf, '&#10;')) then $lf else $lf || '&#10;'"/>
    <xsl:variable name="fields" as="element(f)*">
      <xsl:analyze-string select="$normalized" regex='("(?:[^"]|"")*"|[^,"\n]*)(,|\n)'>
        <xsl:matching-substring>
          <xsl:variable name="raw" select="regex-group(1)"/>
          <f last="{regex-group(2) = '&#10;'}">
            <xsl:value-of select="if (starts-with($raw, '&quot;'))
                                  then replace(substring($raw, 2, string-length($raw) - 2), '&quot;&quot;', '&quot;')
                                  else $raw"/>
          </f>
        </xsl:matching-substring>
        <xsl:non-matching-substring>
          <xsl:message terminate="yes" expand-text="yes">Malformed CSV near: {.}</xsl:message>
        </xsl:non-matching-substring>
      </xsl:analyze-string>
    </xsl:variable>
    <xsl:for-each-group select="$fields" group-ending-with="f[@last = 'true']">
      <!-- a blank line is one empty field: skip it -->
      <xsl:if test="not(count(current-group()) = 1 and current-group() = '')">
      <row>
        <xsl:for-each select="current-group()"><f><xsl:value-of select="."/></f></xsl:for-each>
      </row>
      </xsl:if>
    </xsl:for-each-group>
  </xsl:function>

  <xsl:template name="xsl:initial-template">
    <xsl:variable name="rows" select="csv:rows($csv)"/>
    <xsl:variable name="header" select="$rows[1]/f ! string()"/>
    <records>
      <xsl:for-each select="$rows[position() gt 1]">
        <record>
          <xsl:for-each select="f">
            <xsl:variable name="i" select="position()"/>
            <xsl:element name="{$header[$i]}"><xsl:value-of select="."/></xsl:element>
          </xsl:for-each>
        </record>
      </xsl:for-each>
    </records>
  </xsl:template>
</xsl:stylesheet>
```

Leave the **Input XML** pane empty when you run this in the playground: with no input document, Saxon starts from the template named `xsl:initial-template`. Supply your own CSV through the `csv` parameter, or edit its default value. The output for the sample above:

```xml
<records>
   <record>
      <id>1</id>
      <name>Ana</name>
      <city>Madrid</city>
      <note/>
   </record>
   <record>
      <id>2</id>
      <name>Cole, Ben</name>
      <city>Berlin</city>
      <note>said "hi"</note>
   </record>
   <record>
      <id>3</id>
      <name>Chloe</name>
      <city>New
York</city>
      <note>multi-line city</note>
   </record>
</records>
```

### How it works, and the details that matter

- **Every match ends in a delimiter.** `xsl:analyze-string` refuses a regex that can match an empty string (an empty field followed by nothing would). Requiring the comma or newline makes every match at least one character long — that is what lets empty fields like `note` on row 1 come through.
- **The text is normalised first.** `\r\n` and lone `\r` become `\n`, and a final newline is added if missing, so the last field always has a delimiter. Testing caught a subtle bug here: checking for the final newline *before* normalising adds a second one when the input ends in a bare `\r`, and you get an extra empty record.
- **Quoted fields are unwrapped once.** The outer quotes are dropped and `""` becomes `"`.
- **Blank lines are skipped**, and anything the regex can't match — typically an unclosed quote — stops the transformation with `Malformed CSV near: "` instead of producing quietly wrong data.

We ran it against five inputs: the sample above, Windows line endings without a final newline, a blank line in the middle, an empty field in the middle of a row, and an unclosed quote. All five behave as described.

Two limitations. It keeps the whole file in memory, so it suits typical integration files, not multi-gigabyte exports. And it is strict RFC 4180: a quote in the *middle* of an unquoted field (`12" pipe`) is reported as malformed. Real exports usually quote such fields; if yours don't, relax the second alternative of the regex.

To read a file instead of a parameter, pass the path through `unparsed-text()`: `csv:rows(unparsed-text('orders.csv'))`.

## The same thing in XSLT 4.0

XPath 4.0 adds a family of CSV functions, so all of the above becomes:

```xml
<!-- XSLT 4.0 -->
<xsl:sequence select="csv-to-xml($csv, { 'header': true() })"/>
```

`csv-to-xml()` returns a document whose `rows` element holds one `row` per record, each with one `field` per value — and with `'header': true()`, each `field` carries a `column` attribute with the column name. The elements are in the `http://www.w3.org/2005/xpath-functions` namespace.

If you would rather work with the data than with XML, `parse-csv()` returns a record:

```xpath
(: XPath 4.0 :)
let $data := parse-csv($csv, { 'header': true() })
return $data?get(2, 'city')
```

The record has `columns` (the header names), `column-index` (name to position), `rows` (one array of strings per row) and `get`, a function that looks a value up by row number and by column name or number. The spec's own example returns `"Aachen"` for `get(2, "city")` on a two-row file.

The rest of the family:

- **`csv-to-arrays($csv)`** — just the rows, one array of strings each.
- **`csv-doc('orders.csv', { 'header': true() })`** — like `parse-csv()`, but reads the file for you.
- **Options** shared by all of them: `separator` and `quote-character` (one character each — `';'` covers most European exports), `header` (`true()`, or a sequence of names to supply your own), `trim-whitespace`, and `comment-marker` for files with comment lines.

The draft is from 29 September 2026 and still changing; Saxon 13 implements the January version. Check the processor you target before relying on the exact option names — [this post covers which processors run 4.0](https://xsltplayground.com/blog/posts/xslt-4-0-saxon-support/).

## Going the other way

Producing CSV from XML is the easier direction, and already covered in [Transforming XML to JSON and CSV with XSLT](https://xsltplayground.com/blog/posts/xslt-xml-to-json-csv/). For the rest of what 4.0 brings, start with [XSLT 4.0: what's new](https://xsltplayground.com/blog/posts/xslt-4-0-new-features/).

The 3.0 parser above runs as-is in the [XSLT 3.0 Online Tester](https://xsltplayground.com/xslt-3-0/) — paste it, leave the input empty, run.
