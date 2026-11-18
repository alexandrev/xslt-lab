---
title: "XPath 4.0 new features: the expressions that will change how you write XSLT"
description: "XPath 4.0 by example: otherwise, string templates, fn{} functions, keyword arguments, map literals, the -> pipeline and more — with the XPath 3.1 you'd write today."
date: 2026-10-04T00:00:00Z
tags: ["xpath4", "xslt4", "xpath", "xslt3"]
keywords: ["xpath 4.0", "xpath 4.0 new features", "xpath otherwise", "xpath string templates", "xslt 4.0"]
---

**Quick answer:** most of what makes XSLT 4.0 code shorter is not in XSLT at all — it is in XPath 4.0, the expression language inside every `select`, `test` and `{...}`. Defaults with `otherwise`, string interpolation with backticks, one-argument functions written as `fn { }`, named arguments, `{ }` map literals: each replaces an idiom you already type in XPath 3.1. Like XSLT 4.0, XPath 4.0 is still a **Community Group draft** (29 September 2026), not a W3C Recommendation, and only Saxon 13 PE/EE runs it ([more on support](https://xsltplayground.com/blog/posts/xslt-4-0-saxon-support/)).

Below, each feature is shown next to the XPath 3.1 you would write today. The 3.1 versions were run on Saxon-HE 12.9 — the processor behind [XSLT Playground](https://xsltplayground.com/xslt-3-0/) — and two of them caught real mistakes, which are flagged as tips. Most examples use this input:

```xml
<staff>
  <employee first="Ana" last="Ruiz" salary="52000" dept="IT"/>
  <employee first="Ben" last="Cole" salary="61000" dept="Sales" bonus="4000"/>
  <employee first="Chloe" last="Diaz" salary="58000" dept="IT"/>
</staff>
```

## otherwise: a default in one word

`A otherwise B` returns `A` unless it is empty, in which case it returns `B`:

```xpath
(: XPath 4.0 :)
@price - (@discount otherwise 0)
```

```xpath
(: XPath 3.1 :)
@price - (@discount, 0)[1]
```

The 3.1 idiom works because `(@discount, 0)` is a sequence and `[1]` takes its first item — the attribute if it exists, the zero if not. `otherwise` says what you mean, and its right-hand side is only evaluated when needed.

## if without else

An `if` with braces can drop the `else`:

```xpath
(: XPath 4.0 :)
if (@price > 100) { @discount }
```

```xpath
(: XPath 3.1 :)
if (@price > 100) then @discount else ()
```

**Tip from testing:** use `>`, not `gt`, on attributes from a document without a schema. Untyped values can't be compared to numbers with `gt` — Saxon raises *XPTY0004: Values are not comparable* — while `>` converts the attribute to a number first.

## String templates

Backticks build a string with `{}` placeholders, in any XPath expression:

```xpath
(: XPath 4.0 :)
employee ! `{@first} {@last} ({@dept})`
```

```xpath
(: XPath 3.1 :)
employee ! (@first || ' ' || @last || ' (' || @dept || ')')
```

Both give `Ana Ruiz (IT)`, `Ben Cole (Sales)`, `Chloe Diaz (IT)`. XSLT 3.0 already has text value templates (`expand-text="yes"`), but they only work in text and attribute content; string templates bring the same idea into expressions, where you build keys, file names and messages.

## fn { } — one-argument functions without the ceremony

`function` can be shortened to `fn`, and a function of one argument can drop its signature entirely and use `.` as the argument — a **focus function**:

```xpath
(: XPath 4.0 :)
sort(employee, (), fn { -@salary })
```

```xpath
(: XPath 3.1 :)
sort(employee, (), function($e) { -xs:decimal($e/@salary) })
```

**Tip from testing:** to print the sorted names, write `$sorted ! @first`, **not** `$sorted/@first`. A path expression returns nodes in document order, so `/` silently throws your sort away: our first test printed `Ana Ben Chloe` instead of `Ben Chloe Ana`. The `!` operator keeps the order you give it. This applies to 3.1 and 4.0 alike.

## highest() and lowest()

"The employee with the top salary" needed a filter with `max()`. 4.0 has functions for it:

```xpath
(: XPath 4.0 :)
highest(employee, key := fn { @salary })
```

```xpath
(: XPath 3.1 :)
employee[@salary = max(../employee/@salary)]
```

Both return Ben. `highest()` returns every item with the top key, so ties are kept, and by default it compares untyped values as numbers.

## Keyword arguments

Any function call can name its arguments with `:=` — the line above already does, with `key := …`. It helps most with optional parameters you want to skip:

```xpath
(: XPath 4.0 :)
substring($code, start := 3)
```

The names are the parameter names in the function signature (`$value`, `$start`, `$length` for `substring`). XPath 3.1 only has positional arguments.

## Map literals: no `map` keyword, conditional entries, kept in order

The `map` keyword becomes optional, entries can be added conditionally, and — new in 4.0 — **maps remember the order of their entries**:

```xpath
(: XPath 4.0 :)
{ 'name': string(@first), 'salary': number(@salary),
  if (@bonus) { map { 'bonus': number(@bonus) } } }
```

```xpath
(: XPath 3.1 :)
map:merge((
  map { 'name': string(@first), 'salary': number(@salary) },
  if (@bonus) then map { 'bonus': number(@bonus) } else ()
))
```

Run the 3.1 version over the input with `method="json"` and you can see why the ordering change matters: Saxon-HE 12.9 writes `{ "salary":52000, "name":"Ana" }` — salary first, though you wrote name first. In 4.0 the JSON comes out in the order you wrote it. (The inner `map` keyword in the 4.0 example is there on purpose: inside `{ }` it keeps the braces of the `if` and of the map apart.)

## The -> pipeline and the =!> mapping arrow

`->` evaluates the left side and makes it the context value (`.`) of the right side, so you can chain steps left to right:

```xpath
(: XPath 4.0 :)
'a b c' -> tokenize(.) -> count(.)
```

```xpath
(: XPath 3.1 :)
'a b c' => tokenize() => count()
```

The 3.1 arrow `=>` already chains, but it always passes the value as the *first argument*. `->` lets you put it anywhere, since it is just `.`.

`=!>` applies a function to **each** item, where `=>` passes the whole sequence:

```xpath
(: XPath 4.0 :)
('apple', 'kiwi') =!> upper-case()
```

```xpath
(: XPath 3.1 :)
('apple', 'kiwi') ! upper-case(.)
```

## Iterating maps and arrays

`for` learns to walk arrays and maps directly:

```xpath
(: XPath 4.0 :)
for member $row in [ ('a', 1), ('b', 2) ] return string-join($row, ':'),
for key $k value $v in { 'EUR': 10, 'USD': 11 } return `{$k}={$v}`
```

```xpath
(: XPath 3.1 :)
array:for-each([ ('a', 1), ('b', 2) ], function($m) { string-join($m, ':') })?*,
map:for-each(map { 'EUR': 10, 'USD': 11 }, function($k, $v) { $k || '=' || $v })
```

The 3.1 version gives `a:1 b:2` and `EUR=10 USD=11` — the last two in no guaranteed order, since 3.1 maps are unordered.

## Destructuring

A `let` can unpack a sequence, an array or a map into several variables:

```xpath
(: XPath 4.0 :)
let $( $first, $second ) := (2, 4)          (: a sequence :)
let $[ $x, $y ] := [ 2, 4 ]                 (: an array :)
let ${ $a, $b } := { 'a': 2, 'b': 4 }       (: a map, by key :)
return $first + $y + $b
```

In 3.1 that is one `let` per value: `let $first := $seq[1]`, `let $x := $array(1)`, `let $a := $map?a`.

## Smaller things that add up

- **Numeric literals:** `1_000_000`, `0xFF`, `0b1010`.
- **New axes:** `preceding-sibling-or-self`, `following-sibling-or-self`, `preceding-or-self`, `following-or-self`.
- **× and ÷** are accepted as operators.
- **Node constructors in XPath:** `element f { . }` was XQuery-only. In 3.1, Saxon rejects it inside XSLT with *XPST0003: Node constructor expressions are allowed only in XQuery, not in XPath* — we hit exactly that while writing [the CSV parser](https://xsltplayground.com/blog/posts/xslt-parse-csv/). In 4.0 it is plain XPath.
- **`fn` is accepted as a synonym for `function`** everywhere, including function types.

## Where to go next

The XSLT side of 4.0 — `xsl:switch`, optional function parameters, `xsl:array` — is in [XSLT 4.0: what's new](https://xsltplayground.com/blog/posts/xslt-4-0-new-features/). Every XPath 3.1 example on this page runs unchanged in the [XSLT 3.0 Online Tester](https://xsltplayground.com/xslt-3-0/); put it in an `xsl:value-of` or `xsl:sequence` inside a template matching `/staff`.
