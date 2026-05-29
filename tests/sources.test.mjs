// Asserts the Sources-of-truth tool is wired correctly:
// - md_sources tool is registered and returns non-empty markdown
//   that includes the YAML block from sources.yaml
// - sources.yaml contains tier_1, specialists, privacy_contract blocks
// - every role markdown references md_sources
// - CITATION_CONVENTIONS mentions md_sources

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "node:fs/promises";
import { tools, getSources, CITATION_CONVENTIONS } from "../extensions/money-desk/registry.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const SOURCES_PATH = join(REPO_ROOT, "extensions", "money-desk", "data", "sources.yaml");

test("md_sources tool is registered", () => {
    const t = tools.find((x) => x.name === "md_sources");
    assert.ok(t, "md_sources must be in the tools array");
    assert.equal(typeof t.handler, "function");
    assert.equal(t.skipPermission, true);
});

test("md_sources returns non-empty markdown with YAML block + privacy contract", async () => {
    const out = await getSources();
    assert.ok(typeof out === "string" && out.length > 1000, "output too short");
    assert.match(out, /Sources of Truth/i);
    assert.match(out, /```yaml/);
    assert.match(out, /tier_1:/);
    assert.match(out, /privacy_contract:/);
    assert.match(out, /FRED/);
    assert.match(out, /SEC EDGAR/);
    assert.match(out, /TreasuryDirect/);
});

test("sources.yaml has the required top-level blocks", async () => {
    const raw = await readFile(SOURCES_PATH, "utf8");
    assert.match(raw, /^tier_1\s*:/m, "sources.yaml must declare tier_1");
    assert.match(raw, /^tier_2\s*:/m, "sources.yaml must declare tier_2");
    assert.match(raw, /^tier_3\s*:/m, "sources.yaml must declare tier_3");
    assert.match(raw, /^specialists\s*:/m, "sources.yaml must declare specialists");
    assert.match(raw, /^privacy_contract\s*:/m, "sources.yaml must declare privacy_contract");
});

test("every role markdown references md_sources", async () => {
    for await (const file of glob(
        join(REPO_ROOT, "extensions", "money-desk", "specialists", "*", "agents", "*.md"),
    )) {
        const raw = await readFile(file, "utf8");
        assert.match(raw, /md_sources/, `${file} must reference md_sources`);
    }
});

test("CITATION_CONVENTIONS mentions md_sources", () => {
    assert.match(CITATION_CONVENTIONS, /md_sources/, "CITATION_CONVENTIONS must reference md_sources");
});
