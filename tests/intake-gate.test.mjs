// Regression: every md_*_skill_* tool MUST gate on no-inputs, returning the
// "intake required" screen with a Step 1 / Step 2 instruction (prose path or
// structured ask_user payload). If any skill ships without an
// `## Inputs needed` (or `## Inputs required`) section in its SKILL.md, the
// gate falls through and the workflow leaks on the first call — that's what
// this test catches.

import test from "node:test";
import assert from "node:assert/strict";
import { tools, SPECIALISTS } from "../extensions/money-desk/registry.mjs";

const skillTools = tools.filter((t) => /^md_[a-z]+_skill_/.test(t.name));

test("every skill tool exists for every registered (specialist, skill) pair", () => {
    const expected = new Set();
    for (const spec of SPECIALISTS) {
        for (const skill of spec.skills) {
            expected.add(`${spec.prefix}_skill_${skill.id}`);
        }
    }
    const actual = new Set(skillTools.map((t) => t.name));
    assert.deepEqual([...actual].sort(), [...expected].sort());
});

for (const t of skillTools) {
    test(`gate fires on no-inputs call: ${t.name}`, async () => {
        const body = await t.handler();
        assert.equal(typeof body, "string", `${t.name} must return a string`);
        assert.match(
            body,
            /intake required/i,
            `${t.name} did not return the gated intake-required screen — likely missing '## Inputs needed' in its SKILL.md`,
        );
        assert.match(
            body,
            /Step 1.*(Ask the user|Call `ask_user`)/i,
            `${t.name} gate must instruct the agent to gather inputs (prose or structured form)`,
        );
        assert.match(
            body,
            /Step 2.*Re-invoke this tool/i,
            `${t.name} gate must instruct the agent to re-invoke with inputs`,
        );
        assert.doesNotMatch(
            body,
            /## Workflow/,
            `${t.name} gate must NOT leak the workflow section on first call`,
        );
    });

    test(`workflow returns when inputs provided: ${t.name}`, async () => {
        const body = await t.handler({ inputs: { _gate_smoke: "yes" } });
        assert.equal(typeof body, "string");
        assert.match(body, /Inputs received/, `${t.name} second call should echo inputs`);
        assert.doesNotMatch(
            body,
            /^# 🛑.*intake required/m,
            `${t.name} should NOT return the gate screen when inputs are provided`,
        );
    });
}

// ── Canonical input keys ────────────────────────────────────────────────
// The gate must hand the agent the skill's real `inputs` key names on the
// FIRST call (from `### Input keys`), never placeholder names, and must flag
// keys it doesn't recognise on the second call.

import { extractInputKeys } from "../extensions/money-desk/registry.mjs";
import { readFileSync as _read } from "node:fs";
import { join as _join } from "node:path";
import { SPECIALISTS as _SPECS, SPECIALISTS_DIR as _DIR } from "../extensions/money-desk/registry.mjs";

for (const spec of _SPECS) {
    for (const skill of spec.skills) {
        const name = `${spec.prefix}_skill_${skill.id}`;
        const md = _read(_join(_DIR, spec.name, "skills", skill.id.replaceAll("_", "-"), "SKILL.md"), "utf8");
        const canonical = extractInputKeys(md);
        const t = tools.find((x) => x.name === name);

        test(`gate hands over canonical input keys: ${name}`, async () => {
            assert.ok(canonical && canonical.keys.length > 0, "SKILL.md has no parseable `### Input keys`");
            const first = await t.handler({});
            assert.doesNotMatch(first, /example_field_1/, "gate still shows placeholder key names");
            if (!/Call `ask_user`/.test(first)) {
                assert.match(first, /Use exactly the key names/);
                for (const k of canonical.keys.slice(0, 2)) assert.ok(first.includes(`"${k}"`), `example should use real key ${k}`);
            }
            const second = await t.handler({ inputs: { [canonical.keys[0]]: "x", zz_not_a_key: 1 } });
            assert.match(second, /Non-canonical keys:\*\* `zz_not_a_key`/);
            assert.ok(!second.includes(`Non-canonical keys:** \`${canonical.keys[0]}\``));
        });
    }
}
