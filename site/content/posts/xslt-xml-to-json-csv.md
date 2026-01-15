---
title: "Transforming XML to JSON and CSV with XSLT"
description: "Patterns for producing modern integration formats while staying in XSLT."
date: 2024-11-24T00:00:00Z
---

XSLT is usually associated with XML-to-XML transformations, but in integration work you often need JSON or CSV. The good news is that XSLT is perfectly capable of producing non-XML outputs when you design the stylesheet for it. The key is to choose the right output method, control whitespace carefully, and build an intermediate structure if it helps clarify the mapping. This post covers practical patterns for generating JSON and CSV from XML while keeping the stylesheet maintainable.

For JSON, the simplest method is to output text and build the JSON structure manually. This gives you precise control, but it also requires careful escaping and formatting. If you are on XSLT 3.0, use maps and arrays and let the processor serialize to JSON. This reduces string manipulation and makes your transform more robust. If you are on XSLT 1.0 or 2.0, you can still build JSON text safely by using templates that escape quotes, backslashes, and control characters.

A clear pattern is to create a template that takes a string and outputs an escaped JSON string. Then, for each object, output the property names and values with explicit commas. Keep a template to handle comma placement so you do not end up with trailing commas in arrays. This is a good place to use position checks like `position() != last()` to decide when to emit a comma. While it can look verbose, the logic is deterministic and easy to debug.

CSV output is simpler but comes with its own hazards. You need to wrap fields that contain commas, quotes, or line breaks. The common rule is to wrap the field in quotes and double any interior quotes. Again, a dedicated template to escape fields pays off. Define the column order explicitly and avoid depending on the source document order. This keeps the CSV consistent even if the XML input changes slightly. If you need multiple CSV sections, consider running two passes: one to compute the rows and one to serialize them.

An example CSV field template can look like this in XSLT 1.0:

```xml
<xsl:template name="csv-field">
  <xsl:param name="value"/>
  <xsl:variable name="escaped" select="translate($value, '&quot;', '&quot;&quot;')"/>
  <xsl:text>"</xsl:text>
  <xsl:value-of select="$escaped"/>
  <xsl:text>"</xsl:text>
</xsl:template>
```

This gives you a reusable building block and keeps the main row template readable. You can also pair it with a `csv-row` template that inserts commas between fields. The result is a clear structure where you can change column order without touching the escaping logic.

When moving between XML and JSON/CSV, consider creating a normalized intermediate structure. For example, if the input XML has a deep hierarchy but your output is a flat list, create a lightweight node set representing rows and columns first. Then serialize that representation into your target format. This approach makes the mapping more explicit and keeps string-heavy output logic confined to a small section of the stylesheet.

Testing is crucial because formatting errors are easy to miss. Validate JSON output with a JSON parser and load CSV into a spreadsheet or a small parser to confirm columns align. This is also where you will notice if a newline or a stray comma slipped in. To keep iteration fast, run your transform with a tool that allows quick input swaps and immediate output inspection.

If you want a quick way to experiment with JSON or CSV output, the online editor at [https://xsltplayground.com](https://xsltplayground.com) is a great option. It lets you run transforms with multiple inputs and see the serialized output instantly, which makes it easy to refine your JSON and CSV strategies.
