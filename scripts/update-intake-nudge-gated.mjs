// One-shot codemod: rewrite the intake nudge in every orchestrator to mention
// that skill tools are now structurally GATED (first call → intake only,
// second call → workflow with inputs echoed). Idempotent.

import { readFile, writeFile } from "node:fs/promises";

const path = "extensions/money-desk/registry.mjs";
const raw = await readFile(path, "utf8");

const OLD = "Intake first: before running any skill, call \\`md_intake({ skill: \"<tool-or-friendly-name>\" })\\` to get its required inputs; for anything missing, STOP and ask the user in plain language (grouped into one message) — do NOT mark personal facts the user could provide as [ASSUMPTION:]. ";
const NEW = "Intake first (HARD-GATED): skill tools are gated — the FIRST call without an \\`inputs\\` object returns ONLY the intake checklist. You MUST then ask the user the listed questions in a single grouped plain-language message, wait for their answers, and re-invoke the skill tool with \\`{ inputs: { field: value, ... } }\\`. The workflow is returned on that second call with the inputs echoed back to the user for verification. NEVER fabricate values to satisfy the gate — that defeats the purpose. ";

if (!raw.includes(OLD)) {
    console.log("Anchor not found — already migrated or anchor changed.");
    process.exit(0);
}

const updated = raw.split(OLD).join(NEW);
const count = (raw.match(new RegExp(OLD.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
await writeFile(path, updated, "utf8");
console.log(`Updated ${count} orchestrator nudges.`);
