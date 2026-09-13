#!/usr/bin/env python3
"""
optimize_images.py

Converts every image in public/assets to WebP, caps the long edge at 2400px,
and rewrites src/content.json, src/projects.js and src/assets.json so the new
filenames resolve. Originals are moved to _originals/ rather than deleted.

Run from the project root (the folder containing package.json):

    python3 optimize_images.py            # convert
    python3 optimize_images.py --dry-run  # report only, change nothing
    python3 optimize_images.py --quality 90 --max 3000

Requires Pillow:
    python3 -m pip install pillow
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import urlparse

try:
    from PIL import Image
except ImportError:
    sys.exit("Missing pillow.  Run:  python3 -m pip install pillow")

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "public" / "assets"
BACKUP = ROOT / "_originals"
SRC = ROOT / "src"
EXTS = {".png", ".jpg", ".jpeg", ".PNG", ".JPG", ".JPEG", ".webp"}


def human(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.0f} {unit}" if unit == "B" else f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def tree_size(path: Path) -> int:
    return sum(f.stat().st_size for f in path.rglob("*") if f.is_file())


def convert(src: Path, quality: int, max_edge: int, dry: bool):
    """Returns (new_path, old_bytes, new_bytes, (w, h))."""
    old_bytes = src.stat().st_size
    dest = src.with_suffix(".webp")

    with Image.open(src) as im:
        im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
        if max(im.size) > max_edge:
            ratio = max_edge / max(im.size)
            im = im.resize(
                (max(1, round(im.width * ratio)), max(1, round(im.height * ratio))),
                Image.LANCZOS,
            )
        size = im.size
        if dry:
            return dest, old_bytes, None, size
        im.save(dest, "WEBP", quality=quality, method=6)

    return dest, old_bytes, dest.stat().st_size, size


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--quality", type=int, default=82, help="WebP quality (default 82)")
    ap.add_argument("--max", type=int, default=2400, dest="max_edge",
                    help="cap the long edge, in px (default 2400)")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not ASSETS.is_dir():
        sys.exit(f"No {ASSETS} — run this from the project root.")
    if not (SRC / "content.json").exists():
        sys.exit(f"No {SRC/'content.json'} — run this from the project root.")

    files = sorted(f for f in ASSETS.rglob("*") if f.is_file() and f.suffix in EXTS)
    if not files:
        sys.exit("No images found under public/assets.")

    before = tree_size(ASSETS)
    print(f"{len(files)} images, {human(before)} total")
    print(f"target: WebP q{args.quality}, long edge ≤ {args.max_edge}px")
    print("(dry run — nothing will be written)\n" if args.dry_run else "")

    # folder/OLDNAME -> folder/NEWNAME, used to rewrite the data files
    renames: dict[str, str] = {}
    # folder/NEWNAME -> (w, h)
    newdims: dict[str, tuple[int, int]] = {}
    saved = 0

    for i, f in enumerate(files, 1):
        rel = f.relative_to(ASSETS)
        try:
            dest, old_b, new_b, size = convert(f, args.quality, args.max_edge, args.dry_run)
        except Exception as exc:
            print(f"  !! {rel}: {exc}")
            continue

        key_old = f"{rel.parent}/{rel.name}"
        key_new = f"{rel.parent}/{dest.name}"
        renames[key_old] = key_new
        newdims[key_new] = size

        if new_b is not None:
            saved += old_b - new_b
            if i % 10 == 0 or i == len(files):
                print(f"  [{i}/{len(files)}] {human(old_b)} -> {human(new_b)}  {rel}")
            if dest != f:
                BACKUP_DIR = BACKUP / rel.parent
                BACKUP_DIR.mkdir(parents=True, exist_ok=True)
                shutil.move(str(f), str(BACKUP_DIR / rel.name))

    if args.dry_run:
        print("\nDry run complete. Re-run without --dry-run to convert.")
        return

    # ---- rewrite the data files -------------------------------------------
    # content.json: the "files" arrays
    cpath = SRC / "content.json"
    content = json.loads(cpath.read_text())
    changed = 0
    for pid, block in content.items():
        if not isinstance(block, dict):
            continue
        default_folder = block.get("folder")
        for g in block.get("groups", []):
            folder = g.get("folder") or default_folder
            new_files = []
            for name in g.get("files", []):
                key = f"{folder}/{name}"
                if key in renames:
                    new_files.append(Path(renames[key]).name)
                    changed += 1
                else:
                    new_files.append(name)
            if "files" in g:
                g["files"] = new_files
    cpath.write_text(json.dumps(content, indent=2) + "\n")

    # assets.json: swap each url's extension, and record the new pixel size
    apath = SRC / "assets.json"
    meta = json.loads(apath.read_text())
    for page, blob in meta.items():
        for idx, im in enumerate(blob.get("images", []), 1):
            path = urlparse(im["url"]).path
            ext = Path(path).suffix or ".jpg"
            key_new = f"{page}/{idx:02d}.webp"
            if f"{page}/{idx:02d}{ext}" in renames:
                im["url"] = im["url"].replace(ext, ".webp", 1)
                if key_new in newdims:
                    im["natural_size"] = list(newdims[key_new])
    apath.write_text(json.dumps(meta, indent=2) + "\n")

    # projects.js: the cover paths
    ppath = SRC / "projects.js"
    js = ppath.read_text()
    js = re.sub(r"(cover: '/assets/home/[^.']+)\.[A-Za-z]+'", r"\1.webp'", js)
    ppath.write_text(js)

    after = tree_size(ASSETS)
    print(f"\n{changed} references rewritten in content.json")
    print(f"assets: {human(before)} -> {human(after)}  (saved {human(saved)})")
    print(f"originals moved to {BACKUP}")
    print("\nNext:  npm run build   then check   du -sh dist")


if __name__ == "__main__":
    main()
