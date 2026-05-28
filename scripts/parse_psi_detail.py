import json

label = "blog mobile"
with open("/tmp/psi_blog_mobile.json") as f:
    d = json.load(f)

audits = d.get("lighthouseResult", {}).get("audits", {})

# LCP element
print("=== LCP element ===")
lcp_el = audits.get("largest-contentful-paint-element", {})
print(json.dumps(lcp_el.get("details", {}), indent=2)[:800])

# Render-blocking resources
print("\n=== Render-blocking resources ===")
rb = audits.get("render-blocking-resources", {})
for item in rb.get("details", {}).get("items", []):
    print(f"  {item.get('wastedMs',0):.0f}ms  {item.get('url','')[:100]}")

# Unused JS
print("\n=== Unused JavaScript ===")
uj = audits.get("unused-javascript", {})
for item in uj.get("details", {}).get("items", [])[:8]:
    print(f"  {item.get('wastedBytes',0)//1024}KB  {item.get('url','')[:100]}")

# Unused CSS
print("\n=== Unused CSS ===")
uc = audits.get("unused-css-rules", {})
for item in uc.get("details", {}).get("items", [])[:5]:
    print(f"  {item.get('wastedBytes',0)//1024}KB  {item.get('url','')[:100]}")

# Network requests
print("\n=== Critical request chains / longest ===")
cr = audits.get("critical-request-chains", {})
print(json.dumps(cr.get("details", {}).get("longestChain", {}), indent=2)[:400])

# Third party summary
print("\n=== Third party summary ===")
tp = audits.get("third-party-summary", {})
for item in tp.get("details", {}).get("items", [])[:8]:
    entity = item.get("entity", "?")
    bs = item.get("blockingTime", 0)
    size = item.get("transferSize", 0) // 1024
    print(f"  {entity:<45} {size}KB  blocking {bs:.0f}ms")

# Main thread work
print("\n=== Main thread work ===")
mt = audits.get("mainthread-work-breakdown", {})
for item in mt.get("details", {}).get("items", [])[:8]:
    print(f"  {item.get('groupLabel',''):<35} {item.get('duration',0):.0f}ms")

# Font display
print("\n=== Font issues ===")
fd = audits.get("font-display", {})
for item in fd.get("details", {}).get("items", [])[:5]:
    print(f"  {item.get('url','')[:80]}")

# uses-text-compression
print("\n=== Network RTT / Latency ===")
for k in ["uses-text-compression", "uses-optimized-images", "modern-image-formats", "uses-responsive-images"]:
    a = audits.get(k, {})
    if a.get("score", 1) < 0.9:
        print(f"  FAIL: {k} — {a.get('displayValue','')}")
        for item in a.get("details", {}).get("items", [])[:3]:
            print(f"    {item.get('url','')[:80]}")
