---
title: "Your RSS feed's stylesheet stops rendering"
seoTitle: "RSS feed stylesheet stops working in Chrome 158 — what to do about xml-stylesheet"
description: "A feed with <?xml-stylesheet?> renders as raw XML once Chrome removes XSLT. The feed itself keeps working — here is what actually changes and the three ways to keep a human-readable page."
date: 2026-09-18T00:00:00Z
tags: ["xslt", "chrome", "rss", "deprecation", "migration"]
---

**Quick answer:** your feed keeps working. Feed readers never used the stylesheet — they parse the XML. What breaks on **17 November 2026** is only the friendly page a human sees when they click the feed link in a browser: instead of your styled "subscribe to this feed" page, Chrome shows the raw XML tree.

This is the most common way sites run into Chrome's XSLT removal, and the least damaging.

## Why feeds ended up with a stylesheet

A feed is XML, and a browser showing raw XML to someone who clicked a link looks broken. The usual fix was one line at the top of the feed:

```xml
<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>
```

and an XSLT stylesheet that turned the feed into a readable page with the site's branding and an explanation of what a feed is. WordPress, Hugo themes, Jekyll plugins and most static-site feed generators have shipped some version of this.

That line is a request to the *browser* to run XSLT. From Chrome 158 it is ignored.

## What is and is not affected

| | Affected |
|---|---|
| Feed readers, podcast apps, aggregators | **No** — they parse the XML directly |
| Anything consuming the feed over HTTP | **No** |
| `<?xml-stylesheet?>` rendering for a human in Chrome | **Yes** |
| The same in Firefox and Safari | Not yet, but both have signalled they will follow |

So the question is narrow: what should a person see when they click your feed link in a browser?

## Three answers, cheapest first

**1. Let it go.** The raw XML is ugly but not wrong, and the number of humans who click a feed URL in a browser is small and shrinking — most subscribe by pasting the URL into a reader. If you cannot justify the work, this is a legitimate choice. Remove the `<?xml-stylesheet?>` line so you are not shipping a no-op.

**2. Serve a real HTML page at a separate URL.** Keep `/feed.xml` as pure XML, and publish a hand-written `/subscribe/` page explaining how to follow the site. Link to it from the site nav. This is more useful than the styled feed ever was, because you can write it for people rather than deriving it from feed entries, and it has no moving parts to break at the next browser deprecation.

**3. Precompile the stylesheet at build time.** If you want the styled page to stay in sync with the feed automatically, run the same XSLT during your build and write the result out as static HTML. Your generator already produces the feed; running one transformation over it is a build step, not a runtime dependency. This keeps exactly the output you have today, with the browser removed from the loop.

There is also a WASM polyfill that re-implements XSLT in the browser. For a feed page it is hard to justify — you would be shipping a compiled XSLT engine so that a page you could have rendered at build time can render itself.

## Before you pick, check the stylesheet runs

Whether you precompile it or port it, the first question is whether your `feed.xsl` still does what you think. These stylesheets are often old, inherited with a theme, and written against browser XSLT 1.0.

Paste it into [XSLT Playground](https://xsltplayground.com/?version=1.0) with your feed XML as the input and run it. If the HTML that comes out matches what Chrome shows today, option 3 is a small build change. If it does not, you have found the real work — and you have found it with two months to spare rather than on the day Chrome ships.

## Related

- [This site uses XSLT: what Chrome's warning means](/blog/chrome-xslt/this-site-uses-xslt-warning/)
- [Chrome is removing XSLT: what breaks and what to do](/blog/posts/chrome-removing-xslt-what-to-do/)
