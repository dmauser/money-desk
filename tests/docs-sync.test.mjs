// Asserts docs/CAPABILITIES.md is in sync with registry.mjs.
// If this fails, run: npm run docs:capabilities
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");

test("docs/CAPABILITIES.md is up to date with registry.mjs", () => {
    const result = spawnSync(process.execPath, ["scripts/generate-capabilities.mjs", "--check"], {
        cwd: REPO,
        encoding: "utf8",
    });
    assert.equal(
        result.status,
        0,
        `docs/CAPABILITIES.md is stale. Run: npm run docs:capabilities\n${result.stderr}${result.stdout}`,
    );
});
