#!/usr/bin/env python3
"""
Reads all /xslt/functions/*.md pages, extracts the first XSLT + XML example,
and adds a `tryUrl` field to the frontmatter that links directly to xsltplayground.com
with the example pre-loaded via base64url query params.
"""
import os
import re
import base64

FUNCTIONS_DIR = os.path.join(
    os.path.dirname(__file__),
    "..", "site", "content", "xslt", "functions"
)
BASE_URL = "https://xsltplayground.com/"
FALLBACK_XML = '<?xml version="1.0" encoding="UTF-8"?>\n<root/>'


def b64url(s: str) -> str:
    return base64.urlsafe_b64encode(s.encode("utf-8")).rstrip(b"=").decode("ascii")


def extract_block(content: str, label: str) -> str | None:
    pattern = rf"\*\*{re.escape(label)}:\*\*\s*```xml\s*\n(.*?)\n```"
    m = re.search(pattern, content, re.DOTALL)
    return m.group(1).strip() if m else None


def process_file(filepath: str) -> str:
    with open(filepath, encoding="utf-8") as f:
        text = f.read()

    # Match YAML frontmatter block
    fm_match = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not fm_match:
        return "no-frontmatter"

    fm_text = fm_match.group(1)
    if "tryUrl:" in fm_text:
        return "already-set"

    # Extract version from frontmatter
    version_m = re.search(r'^version:\s*["\']?([^"\'\n]+)["\']?', fm_text, re.MULTILINE)
    version = version_m.group(1).strip() if version_m else "1.0"

    content = text[fm_match.end():]

    xslt = extract_block(content, "Stylesheet")
    xml = extract_block(content, "Input XML")

    if not xslt:
        return "no-xslt"

    if not xml:
        xml = FALLBACK_XML

    url = f"{BASE_URL}?xslt={b64url(xslt)}&xml={b64url(xml)}&version={version}"

    # Insert tryUrl before the closing --- of the frontmatter
    insert_pos = fm_match.end() - 4  # points to start of closing ---\n
    new_text = text[:insert_pos] + f'tryUrl: "{url}"\n' + text[insert_pos:]

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_text)

    return "ok"


def main():
    functions_dir = os.path.abspath(FUNCTIONS_DIR)
    files = [
        f for f in os.listdir(functions_dir)
        if f.endswith(".md") and f != "_index.md"
    ]

    counts = {"ok": 0, "already-set": 0, "no-xslt": 0, "no-frontmatter": 0, "error": 0}

    for fname in sorted(files):
        fpath = os.path.join(functions_dir, fname)
        try:
            result = process_file(fpath)
            counts[result] = counts.get(result, 0) + 1
            if result not in ("ok", "already-set"):
                print(f"  SKIP [{result}] {fname}")
        except Exception as e:
            counts["error"] += 1
            print(f"  ERROR {fname}: {e}")

    print(f"\nDone: {counts['ok']} updated, {counts['already-set']} already had tryUrl, "
          f"{counts['no-xslt']} skipped (no stylesheet found), {counts['error']} errors")


if __name__ == "__main__":
    main()
