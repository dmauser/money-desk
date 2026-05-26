// End-to-end smoke test of bin/cli.mjs:
//   1. --version prints package.json version
//   2. init --project against a fresh tmp git repo
//   3. re-init is idempotent (no duplicate .gitignore lines)
//   4. uninstall --project removes the extension dir
//   5. status runs without an installation
//
// Does NOT touch the developer's real ~/.copilot/ directory.

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..");
const CLI = join(REPO_ROOT, "bin", "cli.mjs");

function run(args, cwd) {
    return spawnSync(process.execPath, [CLI, ...args], {
        cwd,
        encoding: "utf8",
        env: { ...process.env, NO_COLOR: "1" },
    });
}

function makeTmpRepo() {
    const dir = mkdtempSync(join(tmpdir(), "money-desk-test-"));
    const git = spawnSync("git", ["init", "-q"], { cwd: dir, encoding: "utf8" });
    if (git.status !== 0) throw new Error(`git init failed: ${git.stderr}`);
    return dir;
}

test("--version prints package.json version", () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8"));
    const r = run(["--version"], REPO_ROOT);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout.trim(), pkg.version);
});

test("init --project copies extension into .github/extensions/", () => {
    const repo = makeTmpRepo();
    try {
        const r = run(["init", "--project"], repo);
        assert.equal(r.status, 0, `init failed: ${r.stderr}\n${r.stdout}`);

        const extDir = join(repo, ".github", "extensions", "money-desk");
        assert.ok(existsSync(extDir), "extension dir should exist");
        assert.ok(existsSync(join(extDir, "extension.mjs")), "extension.mjs should be copied");
        assert.ok(existsSync(join(extDir, "registry.mjs")), "registry.mjs should be copied");
        assert.ok(existsSync(join(extDir, "specialists")), "specialists dir should be copied");

        const gi = readFileSync(join(repo, ".gitignore"), "utf8");
        assert.ok(gi.includes(".github/extensions/money-desk/"), ".gitignore should contain entry");
    } finally {
        rmSync(repo, { recursive: true, force: true });
    }
});

test("re-running init --project does not duplicate .gitignore lines", () => {
    const repo = makeTmpRepo();
    try {
        const a = run(["init", "--project"], repo);
        assert.equal(a.status, 0, a.stderr);
        const b = run(["init", "--project"], repo);
        assert.equal(b.status, 0, b.stderr);

        const gi = readFileSync(join(repo, ".gitignore"), "utf8");
        const matches = gi.match(/\.github\/extensions\/money-desk\//g) ?? [];
        assert.equal(matches.length, 1, `expected exactly one gitignore entry, got ${matches.length}`);
    } finally {
        rmSync(repo, { recursive: true, force: true });
    }
});

test("uninstall --project removes the extension dir", () => {
    const repo = makeTmpRepo();
    try {
        run(["init", "--project"], repo);
        const r = run(["uninstall", "--project"], repo);
        assert.equal(r.status, 0, r.stderr);

        const extDir = join(repo, ".github", "extensions", "money-desk");
        assert.equal(existsSync(extDir), false, "extension dir should be removed");
    } finally {
        rmSync(repo, { recursive: true, force: true });
    }
});

test("status runs without an installation and exits 0", () => {
    const repo = makeTmpRepo();
    try {
        const r = run(["status"], repo);
        assert.equal(r.status, 0, r.stderr);
    } finally {
        rmSync(repo, { recursive: true, force: true });
    }
});
