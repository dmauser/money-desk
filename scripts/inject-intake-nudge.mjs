// One-shot codemod: inject an "Intake first" sentence into every specialist
// orchestrator in registry.mjs, anchored to the same friendly-name nudge
// sentence already present in all 18 orchestrators.
//
// Idempotent: skips orchestrators that already contain the intake nudge.

import { readFile, writeFile } from "node:fs/promises";

const path = "extensions/money-desk/registry.mjs";
const raw = await readFile(path, "utf8");

const ANCHOR = 'When referring to any skill or specialist inline';
const NUDGE_MARKER = 'Intake first: before running any skill';
// Use a single-quoted JS-source insert to avoid template-literal backtick traps.
const INSERT = "Intake first: before running any skill, call \\`md_intake({ skill: \"<tool-or-friendly-name>\" })\\` to get its required inputs; for anything missing, STOP and ask the user in plain language (grouped into one message) — do NOT mark personal facts the user could provide as [ASSUMPTION:]. ";

const lines = raw.split("\n");
let modified = 0;
let skipped = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes(ANCHOR)) continue;
    if (line.includes(NUDGE_MARKER)) { skipped++; continue; }
    lines[i] = line.replace(ANCHOR, INSERT + ANCHOR);
    modified++;
}

await writeFile(path, lines.join("\n"), "utf8");
console.log(`Modified ${modified} orchestrators; skipped ${skipped} already-modified.`);
