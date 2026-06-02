"""test_renderer_sync.py — unit tests for extensions.money-desk.lib.renderer_sync.

Validates the auto-sync behaviour that gates every render path:
  * fresh project → cache is created with all tracked files
  * stale file → overwritten with canonical bytes
  * non-tracked user files → preserved
  * manifest fast-path → no copy I/O on warm calls
  * force=True → bypasses fast-path
  * missing canonical → clear error (no half-synced cache)
  * concurrent calls → idempotent + race-free
"""
from __future__ import annotations

import hashlib
import importlib.util
import shutil
import threading
from pathlib import Path

import pytest

# The lib/ folder is not a Python package (no __init__.py) so import directly
# via importlib.util to keep the module pure-stdlib.
_THIS = Path(__file__).resolve()
_LIB_PATH = _THIS.parents[1] / "lib" / "renderer_sync.py"
_spec = importlib.util.spec_from_file_location("money_desk_renderer_sync", _LIB_PATH)
renderer_sync = importlib.util.module_from_spec(_spec)
import sys
sys.modules["money_desk_renderer_sync"] = renderer_sync
_spec.loader.exec_module(renderer_sync)


def _canonical_dir() -> Path:
    return _THIS.parents[1] / "renderers"


def _seed_local_only_helper(cache_dir: Path, name: str = "inspect_qa.py", body: str = "# user helper\n") -> Path:
    cache_dir.mkdir(parents=True, exist_ok=True)
    p = cache_dir / name
    p.write_text(body, encoding="utf-8")
    return p


def test_fresh_project_creates_cache_with_all_tracked_files(tmp_path):
    report = renderer_sync.ensure_renderer_cache(tmp_path)
    cache_dir = tmp_path / "money-desk" / "_renderers"
    for name in renderer_sync.TRACKED:
        p = cache_dir / name
        assert p.is_file(), f"{name} should be present after first sync"
    assert (cache_dir / "RENDERERS_MANIFEST.json").is_file()
    assert report.fast_path is False
    assert sorted(report.updated) == sorted(renderer_sync.TRACKED)
    assert report.unchanged == []


def test_stale_file_is_overwritten(tmp_path):
    # Prime cache.
    renderer_sync.ensure_renderer_cache(tmp_path)
    cache_dir = tmp_path / "money-desk" / "_renderers"
    target = cache_dir / "make_xlsx.py"
    canonical_bytes = (_canonical_dir() / "make_xlsx.py").read_bytes()
    # Overwrite with different content.
    stale = b"# truncated\n"
    target.write_bytes(stale)
    assert target.read_bytes() == stale

    # Force=True (cache manifest is still valid; fast-path would otherwise skip).
    report = renderer_sync.ensure_renderer_cache(tmp_path, force=True)
    assert "make_xlsx.py" in report.updated
    assert target.read_bytes() == canonical_bytes


def test_local_only_files_are_preserved(tmp_path):
    cache_dir = tmp_path / "money-desk" / "_renderers"
    helper = _seed_local_only_helper(cache_dir)
    body_before = helper.read_text(encoding="utf-8")

    renderer_sync.ensure_renderer_cache(tmp_path)
    assert helper.is_file(), "user-authored inspect_qa.py must survive sync"
    assert helper.read_text(encoding="utf-8") == body_before

    # And again on fast-path.
    renderer_sync.ensure_renderer_cache(tmp_path)
    assert helper.is_file()
    assert helper.read_text(encoding="utf-8") == body_before


def test_manifest_fast_path_skips_io(tmp_path, monkeypatch):
    # Prime the cache.
    renderer_sync.ensure_renderer_cache(tmp_path)

    calls: list[tuple] = []

    def _spy(src, dst, *args, **kwargs):
        calls.append((str(src), str(dst)))

    monkeypatch.setattr(renderer_sync.shutil, "copy2", _spy)

    report = renderer_sync.ensure_renderer_cache(tmp_path)
    assert report.fast_path is True, "second call should hit the manifest fast-path"
    assert calls == [], f"fast-path must not invoke shutil.copy2, got: {calls}"
    assert report.updated == []
    assert sorted(report.unchanged) == sorted(renderer_sync.TRACKED)


def test_force_true_bypasses_manifest(tmp_path, monkeypatch):
    renderer_sync.ensure_renderer_cache(tmp_path)
    calls: list[tuple] = []
    real_copy = renderer_sync.shutil.copy2

    def _spy(src, dst, *args, **kwargs):
        calls.append((Path(src).name, Path(dst).name))
        return real_copy(src, dst, *args, **kwargs)

    monkeypatch.setattr(renderer_sync.shutil, "copy2", _spy)

    report = renderer_sync.ensure_renderer_cache(tmp_path, force=True)
    assert report.fast_path is False
    # force=True must copy every tracked file regardless of cache state.
    copied_names = {n for (n, _) in calls}
    assert copied_names == set(renderer_sync.TRACKED), copied_names


def test_missing_canonical_file_raises_clear_error(tmp_path, monkeypatch):
    # Make the resolver point at a directory that has the manifest but no
    # tracked files, and assert we never produce a half-synced cache.
    fake_canonical = tmp_path / "fake-renderers"
    fake_canonical.mkdir()
    # Copy the real manifest in (so the manifest read succeeds); leave files absent.
    real_manifest = (_canonical_dir() / "RENDERERS_MANIFEST.json").read_text(encoding="utf-8")
    (fake_canonical / "RENDERERS_MANIFEST.json").write_text(real_manifest, encoding="utf-8")

    monkeypatch.setattr(renderer_sync, "_renderers_dir", lambda: fake_canonical)

    with pytest.raises(renderer_sync.RendererSyncError) as exc:
        renderer_sync.ensure_renderer_cache(tmp_path / "proj")
    assert "missing" in str(exc.value).lower()

    # And confirm we did NOT leave a partial cache behind.
    cache_dir = tmp_path / "proj" / "money-desk" / "_renderers"
    assert not cache_dir.exists() or not any(cache_dir.iterdir()), (
        "no half-synced cache should be left when canonical files are missing"
    )


def test_idempotent_under_concurrent_calls(tmp_path):
    errors: list[BaseException] = []
    barrier = threading.Barrier(4)

    def _go():
        try:
            barrier.wait(timeout=5)
            for _ in range(3):
                renderer_sync.ensure_renderer_cache(tmp_path)
        except BaseException as exc:  # pragma: no cover
            errors.append(exc)

    threads = [threading.Thread(target=_go) for _ in range(4)]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=10)

    assert not errors, f"concurrent ensure_renderer_cache calls must not raise: {errors}"

    # Final state: every tracked file matches canonical bytes.
    cache_dir = tmp_path / "money-desk" / "_renderers"
    for name in renderer_sync.TRACKED:
        actual = (cache_dir / name).read_bytes()
        canonical = (_canonical_dir() / name).read_bytes()
        assert hashlib.sha256(actual).hexdigest() == hashlib.sha256(canonical).hexdigest()
