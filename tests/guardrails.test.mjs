// Verify the [UNSOURCED] citation guardrail is present everywhere it must be.
// This is a regression test: anyone editing prompts must keep this rule intact.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { SPECIALISTS, SPECIALISTS_DIR, buildCapabilitiesSummary } from "../extensions/money-desk/registry.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const UNSOURCED = /\[UNSOURCED\]/;

test("global guardrails block in buildCapabilitiesSummary mentions [UNSOURCED]", () => {
    const summary = buildCapabilitiesSummary();
    assert.match(summary, UNSOURCED, "buildCapabilitiesSummary() output must enforce the citation rule");
});

test("every specialist orchestrator mentions [UNSOURCED]", () => {
    const missing = SPECIALISTS.filter((s) => !UNSOURCED.test(s.orchestrator));
    assert.deepEqual(
        missing.map((s) => s.prefix),
        [],
        `These orchestrators are missing the [UNSOURCED] guardrail: ${missing.map((s) => s.prefix).join(", ")}`,
    );
});

test("every specialist role markdown mentions [UNSOURCED]", async () => {
    const missing = [];
    for (const spec of SPECIALISTS) {
        const path = join(SPECIALISTS_DIR, spec.name, "agents", `${spec.name}.md`);
        const body = await readFile(path, "utf8");
        if (!UNSOURCED.test(body)) missing.push(spec.name);
    }
    assert.deepEqual(
        missing,
        [],
        `These role files are missing the [UNSOURCED] guardrail: ${missing.join(", ")}`,
    );
});

const FRIENDLY_NAME_RULE = /friendly name/i;

test("every specialist orchestrator instructs the model to use the friendly name", () => {
    const missing = SPECIALISTS.filter((s) => !FRIENDLY_NAME_RULE.test(s.orchestrator));
    assert.deepEqual(
        missing.map((s) => s.prefix),
        [],
        `These orchestrators do not tell the model to use the friendly skill name: ${missing.map((s) => s.prefix).join(", ")}`,
    );
});

test("global capabilities summary documents the friendly-name convention", () => {
    const summary = buildCapabilitiesSummary();
    assert.match(summary, /friendly name/i, "buildCapabilitiesSummary() must document the friendly-name rule");
});

const INTAKE_RULE = /md_intake|intake first/i;

test("every specialist orchestrator instructs the model to call md_intake first", () => {
    const missing = SPECIALISTS.filter((s) => !INTAKE_RULE.test(s.orchestrator));
    assert.deepEqual(
        missing.map((s) => s.prefix),
        [],
        `These orchestrators are missing the intake-first nudge: ${missing.map((s) => s.prefix).join(", ")}`,
    );
});

test("global capabilities summary documents the intake-first rule", () => {
    const summary = buildCapabilitiesSummary();
    assert.match(summary, INTAKE_RULE, "buildCapabilitiesSummary() must mention md_intake or intake-first");
});
