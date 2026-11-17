// Every tool id mentioned in shipped markdown / registry prompt text
// (e.g. `md_ds_skill_payoff_plan`, `md_lp_role`) must be a registered tool.
// Catches renamed or invented ids that would send the agent to a dead end.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tools } from "../extensions/money-desk/registry.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const NAMES = new Set(tools.map((t) => t.name));
const TOOL_ID = /\bmd_[a-z]{2}_(?:role|orchestrate|skill_[a-z0-9_]+)\b/g;

function walk(dir, out = []) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        // CHANGELOGs are history: they may name ids that were later renamed.
        else if (/\.(md|mjs)$/.test(e.name) && !/CHANGELOG\.md$/.test(e.name)) out.push(p);
    }
    return out;
}

const FILES = [
    ...walk(join(REPO, "extensions", "money-desk")),
    ...walk(join(REPO, "skills")),
    join(REPO, "README.md"),
    ...walk(join(REPO, "docs")),
];

test("every referenced md_* tool id is registered", () => {
    const missing = [];
    for (const f of FILES) {
        const text = readFileSync(f, "utf8");
        for (const m of text.matchAll(TOOL_ID)) {
            if (!NAMES.has(m[0])) missing.push(`${m[0]}  (${relative(REPO, f).replaceAll("\\", "/")})`);
        }
    }
    assert.deepEqual([...new Set(missing)], [], `Unknown tool ids referenced:\n  ${[...new Set(missing)].join("\n  ")}`);
});
