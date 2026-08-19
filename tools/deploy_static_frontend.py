#!/usr/bin/env python3
"""Build the frontend and publish it to a web server's document root.

Makes the lighttpd static deployment repeatable: build with Vite, mirror
frontend/dist into the given http_root (removing files that are no longer part
of the build), and hand ownership to the web server user.

    python tools/deploy_static_frontend.py /var/www/microbrew/html
    python tools/deploy_static_frontend.py /var/www/microbrew/html --dry-run
    python tools/deploy_static_frontend.py /srv/site --skip-build --owner nobody:nogroup

The production build reads frontend/.env.production, whose empty VITE_API_BASE
makes the bundle call same-origin /api/... — the web server is expected to
reverse-proxy those to the backend.
"""

import argparse
import filecmp
import os
import shutil
import subprocess
import sys

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_FRONTEND = os.path.join(_ROOT, "frontend")
_DIST = os.path.join(_FRONTEND, "dist")
# Refuse to mirror over anything that would take the system with it.
_PROTECTED = {"/", "/etc", "/usr", "/var", "/var/www", "/home", "/root", "/boot", "/srv"}


def build():
    """Run the Vite production build; npm must be installed."""
    if not shutil.which("npm"):
        sys.exit("npm not found — install nodejs/npm or pass --skip-build")
    print("building frontend…")
    subprocess.run(["npm", "--prefix", _FRONTEND, "run", "build"], check=True)


def check_dist():
    index = os.path.join(_DIST, "index.html")
    if not os.path.isfile(index):
        sys.exit(f"no build to deploy: {index} is missing (drop --skip-build?)")


def plan(dest):
    """Return (new_or_changed, unchanged, stale) paths relative to dist."""
    wanted = set()
    for base, _, files in os.walk(_DIST):
        for name in files:
            wanted.add(os.path.relpath(os.path.join(base, name), _DIST))
    have = set()
    if os.path.isdir(dest):
        for base, _, files in os.walk(dest):
            for name in files:
                have.add(os.path.relpath(os.path.join(base, name), dest))
    changed, same = [], []
    for rel in sorted(wanted):
        target = os.path.join(dest, rel)
        if os.path.isfile(target) and filecmp.cmp(os.path.join(_DIST, rel), target, shallow=False):
            same.append(rel)
        else:
            changed.append(rel)
    return changed, same, sorted(have - wanted)


def copy_tree(dest, stale):
    """Mirror dist into dest: copy everything, then drop files the build dropped."""
    for base, _, files in os.walk(_DIST):
        rel_dir = os.path.relpath(base, _DIST)
        out_dir = dest if rel_dir == "." else os.path.join(dest, rel_dir)
        os.makedirs(out_dir, exist_ok=True)
        for name in files:
            shutil.copy2(os.path.join(base, name), os.path.join(out_dir, name))
    for rel in stale:
        os.remove(os.path.join(dest, rel))
    # Prune directories the build no longer produces.
    for base, dirs, files in os.walk(dest, topdown=False):
        if base != dest and not dirs and not files:
            os.rmdir(base)


def set_owner(dest, owner):
    if not owner:
        return
    if not shutil.which("chown"):
        print("chown not available — leaving ownership as is")
        return
    subprocess.run(["chown", "-R", owner, dest], check=True)
    print(f"ownership set to {owner}")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("http_root", help="document root to publish into (created if missing)")
    ap.add_argument("--skip-build", action="store_true", help="publish the existing frontend/dist as is")
    ap.add_argument("--dry-run", action="store_true", help="report what would change, touch nothing")
    ap.add_argument("--owner", default="www-data:www-data", help="chown -R target (empty to skip)")
    args = ap.parse_args()

    dest = os.path.abspath(args.http_root)
    if dest.rstrip("/") in _PROTECTED:
        sys.exit(f"refusing to mirror over {dest} — pass a dedicated document root")

    if not args.skip_build and not args.dry_run:
        build()
    check_dist()

    changed, same, stale = plan(dest)
    print(f"{len(changed)} new/changed, {len(same)} unchanged, {len(stale)} stale -> {dest}")
    for rel in changed[:10]:
        print(f"  + {rel}")
    if len(changed) > 10:
        print(f"  + … {len(changed) - 10} more")
    for rel in stale[:10]:
        print(f"  - {rel}")
    if len(stale) > 10:
        print(f"  - … {len(stale) - 10} more")

    if args.dry_run:
        print("dry run — nothing written")
        return 0
    if not changed and not stale:
        print("already up to date")
        set_owner(dest, args.owner)
        return 0

    os.makedirs(dest, exist_ok=True)
    copy_tree(dest, stale)
    set_owner(dest, args.owner)
    total = sum(os.path.getsize(os.path.join(b, f)) for b, _, fs in os.walk(dest) for f in fs)
    print(f"published {len(changed) + len(same)} files ({total / 1e6:.1f} MB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
