#!/usr/bin/env python3
"""
sync_assets.py

Makes src/content.json, src/projects.json, src/site.json and src/assets.json
agree with the image files actually in public/assets.

It only touches references that are broken. A path pointing at a file that
exists is left alone — important now that one folder can hold several formats
of the same name, where guessing by stem could rewrite a working .webp to a
stale .jpg sitting beside it.

Run from the project root:

    python3 sync_assets.py            # report and fix
    python3 sync_assets.py --check    # report only, change nothing
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "public" / "assets"
SRC = ROOT / "src"
PREFER = [".webp", ".png", ".jpg", ".jpeg"]

fixed = 0
missing: list[str] = []


def index():
    """Every image on disk: exact relative paths, plus stem -> candidates."""
    exact: set[str] = set()
    by_stem: dict[str, list[str]] = {}
    for f in ASSETS.rglob("*"):
        if not f.is_file() or f.suffix.lower() not in PREFER:
            continue
        rel = f.relative_to(ASSETS).as_posix()
        exact.add(rel)
        by_stem.setdefault(str(Path(rel).with_suffix("")), []).append(rel)
    return exact, by_stem


def resolve(rel, exact, by_stem, label):
    """The path this reference should use, or None if nothing matches."""
    global fixed
    if rel in exact:
        return rel                       # already correct — leave it alone

    options = by_stem.get(str(Path(rel).with_suffix("")))
    if not options:
        missing.append(f"{label}: {rel}")
        return None

    best = sorted(options, key=lambda p: PREFER.index(p.lower()[p.rfind('.'):])
                  if p.lower()[p.rfind('.'):] in PREFER else 99)[0]
    fixed += 1
    return best


def each(paths, exact, by_stem, label):
    """Resolve a list of /assets/... references, preserving anything odd."""
    out = []
    for src in paths or []:
        m = re.match(r"/assets/(.+)$", src or "")
        if not m:
            out.append(src)
            continue
        got = resolve(m.group(1), exact, by_stem, label)
        out.append(f"/assets/{got}" if got else src)
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="report only")
    args = ap.parse_args()

    if not ASSETS.is_dir() or not (SRC / "content.json").exists():
        sys.exit("Run this from the project root (the folder with package.json).")

    exact, by_stem = index()
    if not exact:
        sys.exit("No images found under public/assets.")
    print(f"{len(exact)} images on disk  "
          f"({', '.join(sorted({Path(p).suffix for p in exact}))})")

    cpath, ppath, spath, apath = (SRC / n for n in
                                  ('content.json', 'projects.json',
                                   'site.json', 'assets.json'))

    content = json.loads(cpath.read_text())
    for block in content["content"]:
        for g in block.get("groups") or []:
            if g.get("images"):          # the CMS writes null for an empty group
                g["images"] = each(g["images"], exact, by_stem, block.get("id", "?"))

    projects = json.loads(ppath.read_text())
    for proj in projects["projects"]:
        got = each([proj.get("cover")], exact, by_stem, f"cover of {proj.get('id')}")
        if got and got[0]:
            proj["cover"] = got[0]

    site = json.loads(spath.read_text())
    for f in site.get("featured") or []:
        got = each([f.get("logo")], exact, by_stem, f"logo {f.get('name')}")
        if got and got[0]:
            f["logo"] = got[0]

    meta = json.loads(apath.read_text())
    for page, blob in meta.items():
        for i, im in enumerate(blob.get("images", []), 1):
            old = Path(urlparse(im["url"]).path).suffix
            got = resolve(f"{page}/{i:02d}{old}", exact, by_stem, page)
            if got:
                new = Path(got).suffix
                if old and old != new:
                    im["url"] = im["url"].replace(old, new, 1)

    report = f"\n{fixed} reference(s) {'would change' if args.check else 'updated'}, " \
             f"{len(missing)} not found."
    if args.check:
        print(report)
        for m in missing[:20]:
            print("  !!", m)
        print("Re-run without --check to apply.")
        return

    cpath.write_text(json.dumps(content, indent=2, ensure_ascii=False) + "\n")
    ppath.write_text(json.dumps(projects, indent=2, ensure_ascii=False) + "\n")
    spath.write_text(json.dumps(site, indent=2, ensure_ascii=False) + "\n")
    apath.write_text(json.dumps(meta, indent=2) + "\n")
    print(report)
    for m in missing[:20]:
        print("  !!", m)
    print("Reload the dev server — Vite picks the change up on its own.")


if __name__ == "__main__":
    main()
