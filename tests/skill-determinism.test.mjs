// Enforces docs/SKILL_DETERMINISM.md on every SKILL.md: a `## Determinism rules`
// section before `## Report Quality` with five subsections in order, an
// assumptions table, a decision table ending in an "otherwise" row, and a
// fenced output template. Also bans unresolved placeholder assumptions.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SPECIALISTS, SPECIALISTS_DIR } from "../extensions/money-desk/registry.mjs";

const SUBSECTIONS = ["Input keys", "Assumptions", "Calculation method", "Decision rules", "Output template"];

function section(body, heading) {
    const re = new RegExp(`^### ${heading}\s*$`, "m");
    const m = body.match(re);
    if (!m) return null;
    const rest = body.slice(m.index + m[0].length);
    const next = rest.search(/^#{2,3} \S/m);
    return next === -1 ? rest : rest.slice(0, next);
}

for (const spec of SPECIALISTS) {
    for (const skill of spec.skills) {
        const slug = skill.id.replaceAll("_", "-");
        const rel = join(spec.name, "skills", slug, "SKILL.md");
        test(`determinism rules: ${rel}`, () => {
            const text = readFileSync(join(SPECIALISTS_DIR, rel), "utf8").replace(/\r\n/g, "\n");
            const det = text.indexOf("\n## Determinism rules\n");
            const rq = text.indexOf("\n## Report Quality");
            assert.ok(det !== -1, "missing `## Determinism rules` section");
            assert.ok(rq === -1 || det < rq, "`## Determinism rules` must come before `## Report Quality`");

            const end = text.slice(det + 1).search(/^## (?!Determinism)/m);
            const body = end === -1 ? text.slice(det) : text.slice(det, det + 1 + end);

            let last = -1;
            for (const h of SUBSECTIONS) {
                const idx = body.search(new RegExp(`^### ${h}\s*$`, "m"));
                assert.ok(idx !== -1, `missing \`### ${h}\``);
                assert.ok(idx > last, `\`### ${h}\` is out of order`);
                last = idx;
            }

            assert.match(section(body, "Input keys"), /^- `[a-z0-9_]+`/m, "Input keys must list `snake_case` keys");
            assert.match(section(body, "Assumptions"), /^\|.*\|\s*$/m, "Assumptions must be a table");
            assert.match(section(body, "Calculation method"), /^\s*1\. /m, "Calculation method must be numbered steps");
            const decisions = section(body, "Decision rules");
            assert.match(decisions, /^\|.*\|\s*$/m, "Decision rules must be a table");
            assert.match(decisions, /otherwise/i, "Decision rules need a final 'otherwise' row");
            assert.match(section(body, "Output template"), /```/, "Output template must be a fenced block");

            assert.doesNotMatch(text, /\bassume X%|\bX% (real )?growth/i, "unresolved placeholder assumption");
        });
    }
}
