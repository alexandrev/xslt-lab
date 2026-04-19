---
title: "lang()"
description: "Returns true if the context node's xml:lang attribute matches the given language code, following BCP 47 prefix rules."
date: 2026-04-18T00:00:00Z
version: "1.0"
versionLabel: "XSLT 1.0"
category: "string function"
syntax: "lang(string)"
tags: ["xslt", "reference", "xpath", "xslt1"]
---

## Description

`lang()` tests whether the context node is written in the language identified by the argument string. It walks up the ancestor-or-self axis to find the nearest `xml:lang` attribute and then compares its value to the argument using a case-insensitive prefix match.

The matching rule is: if the `xml:lang` value equals the argument (case-insensitive), or if it equals the argument followed by a hyphen (`-`) and any subtag, then `lang()` returns `true`. For example, `lang('en')` returns `true` for nodes where `xml:lang` is `en`, `en-US`, `en-GB`, or `EN-AU`.

This makes `lang()` well-suited for filtering multilingual documents by language family without needing to enumerate every regional variant explicitly.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `string` | xs:string | Yes | The language code to test against (e.g. `"en"`, `"fr"`, `"zh-Hant"`). |

## Return value

`xs:boolean` — `true` if the context node's effective `xml:lang` matches the argument, `false` otherwise.

## Examples

### Filter paragraphs by language

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<doc>
  <para xml:lang="en">Hello, world.</para>
  <para xml:lang="fr">Bonjour le monde.</para>
  <para xml:lang="en-GB">Cheers, mate.</para>
</doc>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/doc">
    <english>
      <xsl:for-each select="para[lang('en')]">
        <p><xsl:value-of select="."/></p>
      </xsl:for-each>
    </english>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<english>
  <p>Hello, world.</p>
  <p>Cheers, mate.</p>
</english>
```

### Inherited xml:lang from ancestor

**Input XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<book xml:lang="de">
  <chapter>
    <title>Einleitung</title>
    <para>Ein einleitender Absatz.</para>
    <para xml:lang="en">An English aside.</para>
  </chapter>
</book>
```

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/book">
    <german-content>
      <xsl:for-each select="//para[lang('de')]">
        <item><xsl:value-of select="."/></item>
      </xsl:for-each>
    </german-content>
  </xsl:template>
</xsl:stylesheet>
```

**Output:**
```xml
<german-content>
  <item>Ein einleitender Absatz.</item>
</german-content>
```

## Notes

- The comparison is **case-insensitive**: `lang('EN')` and `lang('en')` behave identically.
- `lang()` searches the **nearest ancestor-or-self** that carries an `xml:lang` attribute. If no such ancestor exists, the function returns `false`.
- The argument is matched as a **prefix**: `lang('zh')` matches `zh-Hant` and `zh-Hans` but not `zho`.
- `lang()` only recognises the `xml:lang` attribute in the XML namespace. A plain `lang` attribute without the `xml:` prefix is ignored.
- In XSLT 2.0+, `lang()` is still available with the same semantics; additionally, the `xsl:sort` element's `lang` attribute drives language-sensitive collation separately.

## See also

- [normalize-space()](../xpath-normalize-space)
- [string()](../xpath-string)
