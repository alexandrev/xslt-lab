import json, sys

files = [
    ("/tmp/psi_mobile.json",      "xsltplayground.com — mobile"),
    ("/tmp/psi_desktop.json",     "xsltplayground.com — desktop"),
    ("/tmp/psi_blog_mobile.json", "blog.xsltplayground.com — mobile"),
    ("/tmp/psi_blog_desktop.json","blog.xsltplayground.com — desktop"),
]

CRUX_LABELS = {
    "LARGEST_CONTENTFUL_PAINT_MS":    "LCP",
    "FIRST_INPUT_DELAY_MS":           "FID",
    "CUMULATIVE_LAYOUT_SHIFT_SCORE":  "CLS",
    "INTERACTION_TO_NEXT_PAINT":      "INP",
    "FIRST_CONTENTFUL_PAINT_MS":      "FCP",
    "EXPERIMENTAL_TIME_TO_FIRST_BYTE":"TTFB",
}

LAB_KEYS = [
    "largest-contentful-paint",
    "first-contentful-paint",
    "total-blocking-time",
    "cumulative-layout-shift",
    "speed-index",
    "interactive",
    "server-response-time",
]

for path, label in files:
    with open(path) as f:
        d = json.load(f)

    cats   = d.get("lighthouseResult", {}).get("categories", {})
    audits = d.get("lighthouseResult", {}).get("audits", {})
    crux   = d.get("loadingExperience", {}).get("metrics", {})
    overall = d.get("loadingExperience", {}).get("overall_category", "?")

    print(f"\n{'='*56}")
    print(f"  {label}")
    print(f"  CrUX overall: {overall}")
    print(f"{'='*56}")

    scores = {c: int(v["score"] * 100) for c, v in cats.items()}
    print(f"  Scores  perf:{scores.get('performance','?')}  "
          f"a11y:{scores.get('accessibility','?')}  "
          f"seo:{scores.get('seo','?')}  "
          f"bp:{scores.get('best-practices','?')}")

    print("\n  Field data (CrUX — real users):")
    for key, lbl in CRUX_LABELS.items():
        mv = crux.get(key, {})
        if not mv:
            continue
        p   = mv.get("percentile", 0)
        cat = mv.get("category", "?")
        sym = {"FAST": "✓", "AVERAGE": "~", "SLOW": "✗"}.get(cat, "?")
        unit = "ms" if "MS" in key else ("" if "SHIFT" in key else "ms")
        print(f"    {sym} {lbl:<5} {p}{unit:<4}  [{cat}]")

    print("\n  Lab data (simulated — Lighthouse):")
    for k in LAB_KEYS:
        a = audits.get(k, {})
        if not a:
            continue
        score = a.get("score")
        sym = "✓" if score is None or score >= 0.9 else ("~" if score >= 0.5 else "✗")
        print(f"    {sym} {k:<35} {a.get('displayValue','?')}")

    # LCP element
    lcp_audit = audits.get("largest-contentful-paint-element", {})
    items = lcp_audit.get("details", {}).get("items", [])
    if items:
        node = items[0].get("items", [{}])[0] if isinstance(items[0], dict) else {}
        node_label = node.get("node", {}).get("nodeLabel", "") or node.get("node", {}).get("snippet", "")
        print(f"\n  LCP element: {node_label[:120]}")

    # Top opportunities
    opps = []
    for k, a in audits.items():
        savings = a.get("details", {}).get("overallSavingsMs", 0) or 0
        if savings > 100:
            opps.append((savings, a.get("title", k), k))
    if opps:
        print("\n  Top opportunities (ms savings):")
        for ms, title, _ in sorted(opps, reverse=True)[:6]:
            print(f"    {ms:>6}ms  {title}")
