// Every `topic.key` md_facts reference written in a specialist markdown file
// must resolve to a real key in data/facts-2026.json, so a skill can never
// send the agent to a figure that isn't there.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { SPECIALISTS_DIR, DATA_DIR } from "../extensions/money-desk/registry.mjs";

const facts = JSON.parse(readFileSync(join(DATA_DIR, "facts-2026.json"), "utf8"));
const TOPICS = Object.keys(facts);
const ALL_KEYS = new Set(Object.values(facts).flatMap((v) => (v && typeof v === "object" ? Object.keys(v) : [])));

function walk(dir, out = []) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith(".md")) out.push(p);
    }
    return out;
}

// A trailing `*` or `_` marks a key prefix (e.g. `.standard_deduction_*`).
const resolves = (keys, key, wildcard) =>
    wildcard || key.endsWith("_") ? [...keys].some((k) => k.startsWith(key)) : keys.has(key);

test("every md_facts topic.key reference resolves", () => {
    const missing = new Set();
    for (const file of walk(SPECIALISTS_DIR)) {
        const text = readFileSync(file, "utf8");
        const where = relative(SPECIALISTS_DIR, file).replaceAll("\\", "/");
        // Fully qualified: `topic.key`
        for (const [, topic, key, star] of text.matchAll(/`([a-z0-9_]+)\.([A-Za-z0-9_]+)(\*?)`/g)) {
            if (!TOPICS.includes(topic)) continue;
            if (!resolves(new Set(Object.keys(facts[topic])), key, star)) missing.add(`${topic}.${key}  (${where})`);
        }
        // Shorthand continuing a previous reference: `.key`
        for (const [, key, star] of text.matchAll(/`\.([a-z0-9_]{6,})(\*?)`/g)) {
            if (!resolves(ALL_KEYS, key, star)) missing.add(`.${key}  (${where})`);
        }
    }
    assert.deepEqual([...missing], [], `Unknown md_facts keys referenced:\n  ${[...missing].join("\n  ")}`);
});
