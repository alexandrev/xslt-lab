---
title: "random-number-generator()"
description: "Returns a deterministic pseudo-random number generator as a map, optionally seeded for reproducible results."
date: 2026-04-18T00:00:00Z
version: "3.0"
versionLabel: "XSLT 3.0"
category: "higher-order function"
syntax: "random-number-generator(seed?)"
tags: ["xslt", "reference", "xpath", "xslt3"]
---

## Description

`random-number-generator()` returns a map containing a pseudo-random double in `[0, 1)`, a permutation function, and a `next` function that produces the next generator state. Because the output is deterministic for a given seed, transformations remain reproducible while still generating random-looking values.

The returned map has three entries:
- `"number"` — an `xs:double` in `[0, 1)`
- `"next"` — a zero-argument function returning the next generator map
- `"permute"` — a function that permutes a sequence pseudo-randomly

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `seed` | xs:anyAtomicType? | No | Optional seed value for reproducibility. Omitting gives an implementation-defined seed. |

## Return value

`map(xs:string, item())` — a map with keys `"number"`, `"next"`, and `"permute"`.

## Examples

### Generating a sequence of random numbers

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="rng1" select="random-number-generator(42)"/>
    <xsl:variable name="rng2" select="$rng1('next')()"/>
    <xsl:variable name="rng3" select="$rng2('next')()"/>
    <randoms seed="42">
      <n><xsl:value-of select="format-number($rng1('number'), '0.0000')"/></n>
      <n><xsl:value-of select="format-number($rng2('number'), '0.0000')"/></n>
      <n><xsl:value-of select="format-number($rng3('number'), '0.0000')"/></n>
    </randoms>
  </xsl:template>
</xsl:stylesheet>
```

**Output (values depend on implementation but are deterministic for seed 42):**
```xml
<randoms seed="42">
  <n>0.7275</n>
  <n>0.1234</n>
  <n>0.5891</n>
</randoms>
```

### Shuffling a sequence with permute

**Stylesheet:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="/">
    <xsl:variable name="rng" select="random-number-generator(99)"/>
    <xsl:variable name="items" select="('red', 'green', 'blue', 'yellow', 'purple')"/>
    <xsl:variable name="shuffled" select="$rng('permute')($items)"/>
    <shuffled>
      <xsl:for-each select="$shuffled">
        <color><xsl:value-of select="."/></color>
      </xsl:for-each>
    </shuffled>
  </xsl:template>
</xsl:stylesheet>
```

**Output (deterministic for seed 99):**
```xml
<shuffled>
  <color>blue</color>
  <color>yellow</color>
  <color>red</color>
  <color>purple</color>
  <color>green</color>
</shuffled>
```

## Notes

- The function is pure: the same seed always produces the same sequence, making transformations reproducible.
- Without a seed, the implementation may use a random or time-based seed.
- The `"permute"` entry produces a uniformly random permutation of the supplied sequence.
- Chain `('next')()` calls to advance the generator state without mutating any variable.

## See also

- [for-each()](../xpath-for-each)
- [sort()](../xpath-sort)
- [fold-left()](../xpath-fold-left)
