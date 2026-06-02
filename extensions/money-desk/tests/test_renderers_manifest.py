"""test_renderers_manifest.py — guards the bundled RENDERERS_MANIFEST.json.

Asserts that:
  1. The manifest exists.
  2. Every entry's sha256 + bytes match the actual file on disk.
  3. Every renderer's `__renderer_version__` constant equals
     `manifest.extension_version` AND the repo-root `package.json` version.
  4. Every `*.py` file in the renderers/ directory is registered in the
     manifest (so a new renderer can't ship without a manifest entry).
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[3]
RENDERERS_DIR = REPO / "extensions" / "money-desk" / "renderers"
MANIFEST = RENDERERS_DIR / "RENDERERS_MANIFEST.json"
PKG = REPO / "package.json"

VERSION_LINE_RE = re.compile(
    r'^__renderer_version__\s*=\s*"([^"]+)"\s*$', re.MULTILINE
)


@pytest.fixture(scope="module")
def manifest() -> dict:
    assert MANIFEST.exists(), f"manifest missing at {MANIFEST}"
    return json.loads(MANIFEST.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def package_version() -> str:
    return json.loads(PKG.read_text(encoding="utf-8"))["version"]


def test_manifest_extension_version_matches_package_json(manifest, package_version):
    assert manifest["extension_version"] == package_version, (
        f"manifest.extension_version={manifest['extension_version']} "
        f"!= package.json.version={package_version}"
    )


def test_manifest_sha_and_bytes_match_disk(manifest):
    for name, entry in manifest["files"].items():
        path = RENDERERS_DIR / name
        assert path.exists(), f"manifest references missing file: {name}"
        body = path.read_bytes()
        actual_sha = hashlib.sha256(body).hexdigest()
        assert actual_sha == entry["sha256"], (
            f"{name}: sha256 mismatch — manifest={entry['sha256'][:12]} "
            f"disk={actual_sha[:12]}. Run "
            f"`node scripts/build-renderers-manifest.mjs`."
        )
        assert len(body) == entry["bytes"], (
            f"{name}: byte count mismatch — manifest={entry['bytes']} "
            f"disk={len(body)}. Run "
            f"`node scripts/build-renderers-manifest.mjs`."
        )


def test_renderer_version_constants_consistent(manifest, package_version):
    for name in manifest["files"]:
        # Only Python renderers carry an embedded version constant; plain
        # docs (README.md) are tracked for cache-sync purposes only.
        if not name.endswith(".py"):
            continue
        path = RENDERERS_DIR / name
        text = path.read_text(encoding="utf-8")
        m = VERSION_LINE_RE.search(text)
        assert m, f"{name}: missing `__renderer_version__ = \"X.Y.Z\"` declaration"
        assert m.group(1) == package_version, (
            f"{name}: __renderer_version__={m.group(1)} != "
            f"package.json.version={package_version}"
        )
        assert m.group(1) == manifest["extension_version"], (
            f"{name}: __renderer_version__={m.group(1)} != "
            f"manifest.extension_version={manifest['extension_version']}"
        )


def test_every_py_renderer_is_in_manifest(manifest):
    py_files = sorted(p.name for p in RENDERERS_DIR.glob("*.py"))
    # Anything starting with `_` other than `_branded.py` is treated as a
    # private helper; if it's a real renderer it should be registered.
    registered = set(manifest["files"].keys())
    missing = [n for n in py_files if n not in registered]
    assert not missing, (
        f"renderer .py file(s) missing from manifest: {missing}. "
        f"Add them to `scripts/build-renderers-manifest.mjs::TRACKED` "
        f"and re-run the build script."
    )
