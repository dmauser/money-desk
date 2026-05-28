// Asserts that the canonical CHANGELOG.md at the repo root is byte-identical
// to the mirror copy at extensions/money-desk/data/CHANGELOG.md (which is
// what ships to users and what `md_changelog` reads at runtime). The mirror
// is auto-synced by `scripts/sync-changelog.mjs`, wired into `npm pretest`
// and `prepublishOnly`. This test catches drift if the script is ever
// disabled or if someone edits the mirror directly.
//
// Also exercises the `md_changelog` tool handler so we know it returns a
// non-empty, parseable response with the latest version header.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { getChangelog, formatLatestChangelogN } from "../extensions/money-desk/registry.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");

const ROOT_CHANGELOG = resolve(REPO, "CHANGELOG.md");
const MIRROR_CHANGELOG = resolve(REPO, "extensions/money-desk/data/CHANGELOG.md");

const ROOT_TXT = readFileSync(ROOT_CHANGELOG, "utf8");
const MIRROR_TXT = readFileSync(MIRROR_CHANGELOG, "utf8");

const LATEST_HEADING = /^##\s+\[(\d+\.\d+\.\d+)\]\s+[—-]\s+\d{4}-\d{2}-\d{2}/m;

test("repo-root CHANGELOG.md mirror is byte-identical to extensions/money-desk/data/CHANGELOG.md", () => {
    assert.equal(
        MIRROR_TXT,
        ROOT_TXT,
        "CHANGELOG.md mirror is out of sync. Run `node scripts/sync-changelog.mjs` (or just `npm test`, which auto-syncs via pretest).",
    );
});

test("md_changelog handler returns the latest released version header", async () => {
    const out = await getChangelog();
    assert.ok(out && out.length > 100, "md_changelog returned empty/short content");
    const match = out.match(LATEST_HEADING);
    assert.ok(match, "md_changelog output does not contain a `## [X.Y.Z] — YYYY-MM-DD` heading");
    const rootMatch = ROOT_TXT.match(LATEST_HEADING);
    assert.equal(
        match[1],
        rootMatch[1],
        "md_changelog's top version does not match CHANGELOG.md's top released version",
    );
});

test("md_changelog excludes the [Unreleased] section", async () => {
    const out = await getChangelog();
    // [Unreleased] should not appear as a top-level heading inside the
    // returned slice. (It's allowed in the file preamble — we don't render
    // it specifically, but we slice from headers UP TO the first version.)
    const unreleasedAsSection = /^##\s+\[Unreleased\]/m.test(out);
    assert.ok(!unreleasedAsSection, "md_changelog should not render the [Unreleased] section");
});

test("formatLatestChangelogN(n) caps the number of versions returned", () => {
    const all = formatLatestChangelogN(ROOT_TXT, 100);
    const two = formatLatestChangelogN(ROOT_TXT, 2);
    const headingsAll = all.match(/^##\s+\[\d+\.\d+\.\d+\]/gm) || [];
    const headingsTwo = two.match(/^##\s+\[\d+\.\d+\.\d+\]/gm) || [];
    assert.equal(headingsTwo.length, 2, "n=2 should return exactly 2 version sections");
    assert.ok(headingsAll.length >= 2, "expected the changelog to have at least 2 released versions");
    assert.ok(two.length < all.length, "n=2 output should be shorter than n=100");
});
