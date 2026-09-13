#!/usr/bin/env python3
"""
sync_assets.py

Makes src/content.json, src/assets.json and src/projects.json agree with the
image files that are actually in public/assets.

Use it whenever the two drift apart — most often after re-running
optimize_images.py (which renames everything to .webp) and then unzipping a
fresh copy of the source, which overwrites those three files with the old
.png / .jpg names.

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


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="report only")
    args = ap.parse_args()

    if not ASSETS.is_dir() or not (SRC / "content.json").exists():
        sys.exit("Run this from the project root (the folder with package.json).")

    # What's actually on disk, keyed by folder + numeric stem: "illini/03" -> "03.webp"
    on_disk: dict[str, str] = {}
    for f in ASSETS.rglob("*"):
        if f.is_file() and f.suffix.lower() in {".webp", ".png", ".jpg", ".jpeg"}:
            on_disk[f"{f.parent.name}/{f.stem}"] = f.name

    if not on_disk:
        sys.exit("No images found under public/assets.")
    exts = sorted({Path(v).suffix for v in on_disk.values()})
    print(f"{len(on_disk)} images on disk  ({', '.join(exts)})")

    fixed = missing = 0

    # ---- content.json (array of projects, full image paths) ---------------
    cpath = SRC / "content.json"
    content = json.loads(cpath.read_text())
    for block in content["content"]:
        for g in block.get("groups", []):
            out = []
            for src in g.get("images", []):
                m = re.match(r"/assets/([^/]+)/([^.]+)\.[A-Za-z]+$", src)
                if not m:
                    out.append(src)
                    continue
                folder, stem = m.group(1), m.group(2)
                real = on_disk.get(f"{folder}/{stem}")
                if real is None:
                    print(f"  !! no file for {folder}/{stem}")
                    missing += 1
                    out.append(src)
                    continue
                new = f"/assets/{folder}/{real}"
                if new != src:
                    fixed += 1
                out.append(new)
            if "images" in g:
                g["images"] = out

    # ---- assets.json (only its extensions matter) -------------------------
    apath = SRC / "assets.json"
    meta = json.loads(apath.read_text())
    for page, blob in meta.items():
        for i, im in enumerate(blob.get("images", []), 1):
            stem = f"{i:02d}"
            real = on_disk.get(f"{page}/{stem}")
            if not real:
                continue
            old_ext = Path(urlparse(im["url"]).path).suffix
            new_ext = Path(real).suffix
            if old_ext and old_ext != new_ext:
                im["url"] = im["url"].replace(old_ext, new_ext, 1)
                fixed += 1

    # ---- projects.json cover paths ---------------------------------------
    ppath = SRC / "projects.json"
    projects = json.loads(ppath.read_text())
    for proj in projects["projects"]:
        cover = proj.get("cover", "")
        m = re.match(r"/assets/([^/]+)/([^.]+)\.[A-Za-z]+$", cover)
        if not m:
            continue
        folder, stem = m.group(1), m.group(2)
        real = on_disk.get(f"{folder}/{stem}")
        if not real:
            print(f"  !! no file for {folder}/{stem} (cover of {proj.get('id')})")
            missing += 1
            continue
        new = f"/assets/{folder}/{real}"
        if new != cover:
            proj["cover"] = new
            fixed += 1

    if args.check:
        print(f"\n{fixed} reference(s) would change, {missing} file(s) missing.")
        print("Re-run without --check to apply.")
        return

    cpath.write_text(json.dumps(content, indent=2, ensure_ascii=False) + "\n")
    apath.write_text(json.dumps(meta, indent=2) + "\n")
    ppath.write_text(json.dumps(projects, indent=2, ensure_ascii=False) + "\n")

    print(f"\n{fixed} reference(s) updated, {missing} file(s) missing.")
    print("Reload the dev server — Vite picks the change up on its own.")


if __name__ == "__main__":
    main()
