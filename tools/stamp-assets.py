#!/usr/bin/env python3
"""Cache busting: rewrite every assets/(css|js)/*?v=... reference in the
HTML pages of public/ (index.html, 404.html) with a short hash of that
file's content.

nginx lets browsers keep /assets/ for 7 days; a changed file gets a new
?v= and is fetched again, an unchanged one keeps its cached copy.
Run by the pre-commit hook (tools/hooks/pre-commit); safe to run by hand.
Prints the pages it rewrote, one per line (nothing if none changed).
"""
import hashlib
import pathlib
import re

PUBLIC = pathlib.Path(__file__).resolve().parent.parent / "public"
REF = re.compile(r'(assets/(?:css|js)/[\w.-]+\.(?:css|js))\?v=[\w.-]*')


def stamp(match):
    rel = match.group(1)
    digest = hashlib.sha1((PUBLIC / rel).read_bytes()).hexdigest()[:8]
    return f"{rel}?v={digest}"


for page in sorted(PUBLIC.glob("*.html")):
    html = page.read_text(encoding="utf-8")
    new = REF.sub(stamp, html)
    if new != html:
        page.write_text(new, encoding="utf-8")
        print(page.relative_to(PUBLIC.parent))
