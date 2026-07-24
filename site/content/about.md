---
title: "About XSLT Playground"
description: "The story behind XSLT Playground — a browser-based XSLT editor built for multi-parameter transforms, fast feedback, and practical debugging."
aliases:
  - /posts/why-xslt-playground-online-editor/
---

[XSLT Playground](https://xsltplayground.com) is a browser-based XSLT editor built for realistic workloads: multiple inputs and parameters, live execution, and timing hints so you can tune transforms without heavy desktop tooling.

## Why I built it

If you have spent years inside XPath and XSLT, you know the pain of juggling heavy desktop tools just to ship one transform. I wanted something faster — a tool that behaves like the lightweight browser utilities we all rely on. So I built XSLT Playground for realistic, multi-input scenarios instead of the single-input demos most tools target.

### The gap traditional editors left open

- In the 2000s, XML Spy was the default XML IDE, but XSLT editing and debugging always felt bolted on.
- Oracle JDeveloper and later Altova tools like MapForce improved visualization and isolated execution, yet they remained heavy, licensed, and resource-hungry.
- Most online options stop at one input document and a simple output. Real integrations rarely look that tidy.

### Inspired by the best small web utilities

For quick daily tasks, I still open [regex101](https://regex101.com) to debug patterns, [base64decode.org](https://www.base64decode.org/) to inspect payloads, and [epochconverter.com](https://www.epochconverter.com/) for timestamps. They are fast, focused, and always there. XSLT deserved the same "open browser, get answers" experience — much like [jqplay.org](https://jqplay.org) did for jq.

### What it delivers

- Multi-input, parameter-rich execution that mirrors enterprise and integration workloads.
- Live runs and inline results so you can iterate without context switching.
- Rough timing so you can spot regressions and optimize hotspots.
- Zero install — it works in the browser, with Saxon HE on the backend for full XSLT 1.0 / 2.0 / 3.0 support.

## What this site gives you

- Release notes and product updates.
- Short guides and a full [XSLT & XPath function reference](/xslt/functions/) that mirror common integration tasks.
- Deployment options, including a Helm chart you can point at your own cluster.

Ready to try it? Open [xsltplayground.com](https://xsltplayground.com) and run your next transform right now.
