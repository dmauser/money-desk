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
