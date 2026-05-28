// Ensures package.json "version" matches the most recent released
// version heading in CHANGELOG.md. Catches the failure mode where a
// CHANGELOG entry is added but the package version is never bumped
// (which makes `npx money-desk --version` and the npm registry stale).
//
// Rules enforced:
//   1. CHANGELOG.md must contain at least one heading of the form
//      `## [X.Y.Z] — YYYY-MM-DD` (the em-dash or a plain `-` is accepted).
//   2. The most recent such heading (first one in the file, since the
//      changelog is reverse-chronological) must equal package.json version.
//   3. `## [Unreleased]` sections are skipped — they may exist above the
//      latest released version, that's fine.
//
// If this fails, either:
//   - bump "version" in package.json to match CHANGELOG, OR
//   - add the missing `## [X.Y.Z] — date` heading to CHANGELOG.md.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");

const pkg = JSON.parse(readFileSync(resolve(REPO, "package.json"), "utf8"));
const changelog = readFileSync(resolve(REPO, "CHANGELOG.md"), "utf8");

// Match `## [1.2.3] — 2026-05-27` or `## [1.2.3] - 2026-05-27`.
// Explicitly skip `## [Unreleased]`.
const VERSION_HEADING = /^##\s+\[(\d+\.\d+\.\d+)\]\s+[—-]\s+\d{4}-\d{2}-\d{2}/m;

test("CHANGELOG.md has at least one released version heading", () => {
    const match = changelog.match(VERSION_HEADING);
    assert.ok(
        match,
        "CHANGELOG.md is missing any released version heading like `## [0.11.5] — 2026-05-27`.",
    );
});

test("package.json version matches the latest CHANGELOG.md version", () => {
    const match = changelog.match(VERSION_HEADING);
    assert.ok(match, "CHANGELOG.md has no released version heading.");
    const latestChangelogVersion = match[1];

    assert.equal(
        pkg.version,
        latestChangelogVersion,
        [
            `\n  package.json version: ${pkg.version}`,
            `  CHANGELOG latest:     ${latestChangelogVersion}`,
            "",
            "  Fix one of these:",
            `    - Bump package.json "version" to ${latestChangelogVersion}, OR`,
            `    - Add a new "## [${pkg.version}] — YYYY-MM-DD" heading to CHANGELOG.md`,
            "      above the previous release (move items from [Unreleased] into it).",
            "",
        ].join("\n"),
    );
});
