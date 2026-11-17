"""renderer_sync — keep a project's ./money-desk/_renderers/ cache aligned
with the canonical renderer scripts shipped inside the money-desk extension.

Used by:
  * Python renderers / CI scripts that want to self-heal before invoking
    ``make_xlsx.py`` / ``make_pdf.py`` / etc. directly (``python -m
    money_desk.lib.renderer_sync`` style usage).
  * The companion JS helper in ``registry.mjs`` mirrors this logic for
    in-process syncing on every MCP tool call. Both share the SAME
    bundled ``RENDERERS_MANIFEST.json`` so truth is unified.

Pure stdlib; no third-party deps. Cross-platform (pathlib + shutil only).
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
import shutil
import threading
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

__all__ = [
    "TRACKED",
    "SyncReport",
    "ensure_renderer_cache",
    "RendererSyncError",
]

# Files mirrored from the canonical renderers/ dir into the user's cache.
# Adding/removing a file here REQUIRES regenerating RENDERERS_MANIFEST.json
# (run ``node scripts/build-renderers-manifest.mjs``).
TRACKED: tuple[str, ...] = (
    "_branded.py",
    "make_docx.py",
    "make_html.py",
    "make_pdf.py",
    "make_xlsx.py",
    "README.md",
)

CACHE_REL: tuple[str, ...] = ("money-desk", "_renderers")
MANIFEST_NAME = "RENDERERS_MANIFEST.json"

_LOG = logging.getLogger("money_desk.renderer_sync")
_WRITE_LOCK = threading.Lock()


class RendererSyncError(RuntimeError):
    """Raised when a canonical file is missing or the bundled manifest is unreadable."""


@dataclass
class SyncReport:
    updated: list[str] = field(default_factory=list)
    unchanged: list[str] = field(default_factory=list)
    cache_dir: Path = field(default_factory=Path)
    extension_dir: Path = field(default_factory=Path)
    fast_path: bool = False
    extension_version: str = ""

    def to_dict(self) -> dict:
        return {
            "updated": list(self.updated),
            "unchanged": list(self.unchanged),
            "cache_dir": str(self.cache_dir),
            "extension_dir": str(self.extension_dir),
            "fast_path": self.fast_path,
            "extension_version": self.extension_version,
        }


def _renderers_dir() -> Path:
    """Resolve the canonical renderers/ dir relative to THIS module file."""
    return Path(__file__).resolve().parent.parent / "renderers"


def _sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def _read_bundled_manifest(canonical_dir: Path) -> dict:
    p = canonical_dir / MANIFEST_NAME
    if not p.is_file():
        raise RendererSyncError(
            f"Bundled renderer manifest missing at {p}. "
            f"Reinstall money-desk to restore."
        )
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise RendererSyncError(f"Bundled manifest at {p} is malformed: {exc}") from exc


def _read_cache_manifest(cache_dir: Path) -> dict | None:
    p = cache_dir / MANIFEST_NAME
    if not p.is_file():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def _atomic_write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + f".tmp.{os.getpid()}")
    tmp.write_text(json.dumps(payload, indent=2, sort_keys=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def _cache_matches_bundled(bundled: dict, cached: dict | None, tracked: Iterable[str]) -> bool:
    if not cached:
        return False
    if cached.get("extension_version") != bundled.get("extension_version"):
        return False
    bundled_files = bundled.get("files") or {}
    cached_files = cached.get("files") or {}
    for name in tracked:
        b = bundled_files.get(name)
        c = cached_files.get(name)
        if not b or not c:
            return False
        if b.get("sha256") != c.get("sha256"):
            return False
    return True


def ensure_renderer_cache(project_root: Path | str, *, force: bool = False) -> SyncReport:
    """Ensure ./money-desk/_renderers/ inside ``project_root`` matches the
    canonical renderers shipped with the extension.

    * Idempotent and concurrency-safe (atomic manifest write + module-level lock).
    * Never touches files outside the TRACKED list — user-authored helpers
      (e.g. ``inspect_qa.py``) are preserved.
    * Fast-path (no I/O for tracked files) when the cache-side manifest
      already matches the bundled hashes and ``force`` is False.

    Raises:
        RendererSyncError: a tracked canonical file is missing on disk, or
        the bundled manifest is missing/malformed. We never produce a
        half-synced cache.
    """
    project_root = Path(project_root)
    canonical_dir = _renderers_dir()
    cache_dir = project_root.joinpath(*CACHE_REL)

    bundled = _read_bundled_manifest(canonical_dir)
    bundled_files: dict = bundled.get("files") or {}
    extension_version: str = bundled.get("extension_version", "")

    # Verify every tracked canonical file actually exists before we promise
    # the caller a fully-synced cache.
    missing = [n for n in TRACKED if not (canonical_dir / n).is_file()]
    if missing:
        raise RendererSyncError(
            f"Canonical renderer file(s) missing from {canonical_dir}: "
            f"{missing}. Reinstall money-desk."
        )

    report = SyncReport(
        cache_dir=cache_dir,
        extension_dir=canonical_dir,
        extension_version=extension_version,
    )

    if not force:
        cache_manifest = _read_cache_manifest(cache_dir)
        if _cache_matches_bundled(bundled, cache_manifest, TRACKED):
            # Verify each tracked file still physically exists (a user could
            # have deleted one without touching the manifest); if all good,
            # take the fast path.
            if all((cache_dir / n).is_file() for n in TRACKED):
                report.fast_path = True
                report.unchanged = list(TRACKED)
                _LOG.debug(
                    "money-desk.renderer_sync fast-path cache=%s ext_version=%s",
                    cache_dir,
                    extension_version,
                )
                return report

    # Slow-path: serialize copies to avoid two threads racing on the same
    # destination file. Hash-comparison work is CPU-only outside the lock
    # to keep contention low.
    decisions: list[tuple[str, bool]] = []  # (name, needs_copy)
    for name in TRACKED:
        canonical = canonical_dir / name
        cached = cache_dir / name
        if force or not cached.is_file():
            decisions.append((name, True))
            continue
        try:
            same = _sha256_of(cached) == _sha256_of(canonical)
        except OSError:
            same = False
        decisions.append((name, not same))

    with _WRITE_LOCK:
        cache_dir.mkdir(parents=True, exist_ok=True)
        for name, needs_copy in decisions:
            if needs_copy:
                shutil.copy2(canonical_dir / name, cache_dir / name)
                report.updated.append(name)
            else:
                report.unchanged.append(name)

        # Write a cache-side manifest mirroring the bundled one (limited to
        # tracked files so we don't accidentally claim user-local extras).
        cache_manifest_payload = {
            "extension_version": extension_version,
            "synced_at": bundled.get("generated_at", ""),
            "files": {n: bundled_files[n] for n in TRACKED if n in bundled_files},
        }
        _atomic_write_json(cache_dir / MANIFEST_NAME, cache_manifest_payload)

    if report.updated:
        _LOG.info(
            "money-desk.renderer_sync updated=%d files=%s cache=%s",
            len(report.updated),
            ",".join(report.updated),
            cache_dir,
        )
    else:
        _LOG.debug("money-desk.renderer_sync no-op cache=%s", cache_dir)

    return report


def _cli(argv: list[str] | None = None) -> int:
    import argparse

    p = argparse.ArgumentParser(
        prog="python -m money_desk.lib.renderer_sync",
        description="Sync ./money-desk/_renderers/ against the canonical renderer scripts.",
    )
    p.add_argument("--project-root", default=".", help="Project root containing ./money-desk/")
    p.add_argument("--force", action="store_true", help="Bypass the manifest fast-path")
    p.add_argument("--quiet", action="store_true", help="Suppress INFO logging")
    args = p.parse_args(argv)

    if not args.quiet:
        logging.basicConfig(level=logging.INFO, format="%(message)s")

    try:
        report = ensure_renderer_cache(Path(args.project_root), force=args.force)
    except RendererSyncError as exc:
        print(f"renderer_sync: {exc}")
        return 2

    print(json.dumps(report.to_dict(), indent=2))
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(_cli())
