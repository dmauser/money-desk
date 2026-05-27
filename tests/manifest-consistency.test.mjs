// Asserts that every tool registered in registry.mjs resolves to real
// content on disk. If a `skillLoader(...)` references a missing SKILL.md,
// this test fails immediately. Same for role loaders.

import test from "node:test";
import assert from "node:assert/strict";
import { tools, SPECIALISTS } from "../extensions/money-desk/registry.mjs";

function isFailure(result) {
    return result && typeof result === "object" && result.resultType === "failure";
}

test("registry has tools", () => {
    assert.ok(tools.length > 0, "expected at least one registered tool");
});

test("every registered tool has required shape", () => {
    for (const t of tools) {
        assert.equal(typeof t.name, "string", `tool missing name: ${JSON.stringify(t)}`);
        assert.equal(typeof t.description, "string", `tool ${t.name} missing description`);
        assert.equal(typeof t.handler, "function", `tool ${t.name} missing handler`);
        assert.equal(t.skipPermission, true, `tool ${t.name} must set skipPermission`);
    }
});

test("tool names are unique", () => {
    const seen = new Set();
    for (const t of tools) {
        assert.ok(!seen.has(t.name), `duplicate tool name: ${t.name}`);
        seen.add(t.name);
    }
});

// md_route is the only tool that takes an argument; pass a stub. Everything
// else has no parameters and should resolve when called with no args.
for (const t of tools) {
    test(`tool resolves: ${t.name}`, async () => {
        const args = t.name === "md_route" ? { query: "monthly budget review" } : {};
        const result = await t.handler(args);
        assert.ok(!isFailure(result), `tool ${t.name} returned failure: ${JSON.stringify(result)}`);
        assert.equal(typeof result, "string", `tool ${t.name} must return a string, got ${typeof result}`);
        assert.ok(result.length > 0, `tool ${t.name} returned empty string`);
    });
}

test("every skill has a displayName", () => {
    for (const spec of SPECIALISTS) {
        for (const skill of spec.skills) {
            assert.equal(
                typeof skill.displayName,
                "string",
                `${spec.prefix}_skill_${skill.id} is missing displayName`,
            );
            assert.ok(skill.displayName.length > 0, `${spec.prefix}_skill_${skill.id} displayName is empty`);
        }
    }
});

test("every skill description leads with its bolded displayName", () => {
    for (const spec of SPECIALISTS) {
        for (const skill of spec.skills) {
            const expected = `**${skill.displayName}**`;
            assert.ok(
                skill.description.startsWith(expected),
                `${spec.prefix}_skill_${skill.id} description must start with ${expected} — got: ${skill.description.slice(0, 80)}`,
            );
        }
    }
});

test("every prefix is namespaced under md_", () => {
    for (const spec of SPECIALISTS) {
        assert.ok(
            spec.prefix.startsWith("md_"),
            `specialist prefix must start with md_: got ${spec.prefix}`,
        );
    }
});

import { extractIntake, getIntake } from "../extensions/money-desk/registry.mjs";

test("extractIntake parses a known SKILL.md inputs section", async () => {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const { SPECIALISTS_DIR } = await import("../extensions/money-desk/registry.mjs");
    const path = join(SPECIALISTS_DIR, "life-disability", "skills", "life-insurance-needs", "SKILL.md");
    const body = await readFile(path, "utf8");
    const intake = extractIntake(body);
    assert.ok(intake && intake.length > 0, "extractIntake should return content for life-insurance-needs");
    assert.match(intake, /Age|Income|Dependents/i, "intake should contain expected fields");
});

test("md_intake returns checklist for friendly skill name", async () => {
    const out = await getIntake("Life Insurance Needs");
    assert.match(out, /Intake checklist/);
    assert.match(out, /Life & Disability/);
    assert.match(out, /md_lp_skill_life_insurance_needs/);
});

test("md_intake without arguments lists all skills", async () => {
    const out = await getIntake();
    assert.match(out, /md_intake/);
    assert.match(out, /Available skills/);
    // should contain a row for at least one well-known skill
    assert.match(out, /Life Insurance Needs/);
});

test("md_intake returns helpful error for unknown skill", async () => {
    const out = await getIntake("totally_made_up_skill");
    assert.match(out, /Unknown skill/);
});

test("skill loader gates on no-inputs call: returns intake-required screen", async () => {
    const lifeInsurance = tools.find((t) => t.name === "md_lp_skill_life_insurance_needs");
    const body = await lifeInsurance.handler();
    assert.match(body, /intake required/i, "first call should return the gated intake-required screen");
    assert.match(body, /Step 1.*Ask the user/i, "gate should instruct the agent to ask the user");
    assert.match(body, /Step 2.*Re-invoke this tool/i, "gate should instruct the agent to re-invoke with inputs");
    assert.doesNotMatch(body, /## Workflow/, "gate should NOT leak the workflow section on first call");
});

test("skill loader returns workflow + echo when inputs provided", async () => {
    const lifeInsurance = tools.find((t) => t.name === "md_lp_skill_life_insurance_needs");
    const body = await lifeInsurance.handler({ inputs: { age: 38, income: 185000, kids: 3 } });
    assert.match(body, /Inputs received/, "second call should echo inputs");
    assert.match(body, /age:.*38/);
    assert.match(body, /income:.*185000/);
    assert.match(body, /## Workflow/, "second call should return the workflow");
});

test("every skill tool advertises an `inputs` parameter", () => {
    for (const spec of SPECIALISTS) {
        for (const skill of spec.skills) {
            const t = tools.find((x) => x.name === `${spec.prefix}_skill_${skill.id}`);
            assert.ok(
                t.parameters?.properties?.inputs,
                `${spec.prefix}_skill_${skill.id} must declare an 'inputs' parameter`,
            );
            assert.equal(t.parameters.properties.inputs.type, "object");
        }
    }
});
