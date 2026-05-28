// Asserts the Report Quality rules are wired correctly:
// - md_report_quality tool is registered and returns non-empty markdown
//   that includes both the TL;DR and the YAML block from preferences.yaml
// - preferences.yaml contains a `report_quality:` block
// - every specialist orchestrator references md_report_quality
// - every role markdown and every SKILL.md references md_report_quality

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "node:fs/promises";
import { tools, SPECIALISTS, getReportQuality } from "../extensions/money-desk/registry.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const PREFS_PATH = join(REPO_ROOT, "extensions", "money-desk", "data", "preferences.yaml");

test("md_report_quality tool is registered", () => {
    const t = tools.find((x) => x.name === "md_report_quality");
    assert.ok(t, "md_report_quality must be in the tools array");
    assert.equal(typeof t.handler, "function");
    assert.equal(t.skipPermission, true);
});

test("md_report_quality returns non-empty markdown with TL;DR + YAML block", async () => {
    const out = await getReportQuality();
    assert.ok(typeof out === "string" && out.length > 500, "output too short");
    assert.match(out, /Report Quality Rules/i);
    assert.match(out, /markdown[^a-z]*inline/i);
    assert.match(out, /```yaml/);
    assert.match(out, /report_quality:/);
});

test("preferences.yaml contains a report_quality: block", async () => {
    const raw = await readFile(PREFS_PATH, "utf8");
    assert.match(raw, /^report_quality\s*:/m, "preferences.yaml must declare report_quality:");
    assert.match(raw, /output_formats\s*:/, "report_quality must define output_formats");
    assert.match(raw, /renderers\s*:/, "report_quality must define renderers");
    assert.match(raw, /brand\s*:/, "report_quality must define brand");
});

test("every specialist orchestrator references md_report_quality", () => {
    for (const s of SPECIALISTS) {
        assert.match(
            s.orchestrator,
            /md_report_quality/,
            `${s.name} orchestrator must reference md_report_quality`,
        );
    }
});

test("every role markdown references md_report_quality", async () => {
    for await (const file of glob(
        join(REPO_ROOT, "extensions", "money-desk", "specialists", "*", "agents", "*.md"),
    )) {
        const raw = await readFile(file, "utf8");
        assert.match(raw, /md_report_quality/, `${file} must reference md_report_quality`);
    }
});

test("every SKILL.md references md_report_quality", async () => {
    let count = 0;
    for await (const file of glob(
        join(REPO_ROOT, "extensions", "money-desk", "specialists", "*", "skills", "*", "SKILL.md"),
    )) {
        const raw = await readFile(file, "utf8");
        assert.match(raw, /md_report_quality/, `${file} must reference md_report_quality`);
        count++;
    }
    assert.ok(count >= 90, `expected ~95 SKILL.md files, found ${count}`);
});

test("renderer scripts ship with the extension", async () => {
    const renderersDir = join(REPO_ROOT, "extensions", "money-desk", "renderers");
    for (const name of ["README.md", "make_pdf.py", "make_html.py", "make_xlsx.py", "make_docx.py"]) {
        const raw = await readFile(join(renderersDir, name), "utf8");
        assert.ok(raw.length > 100, `${name} too short / missing`);
    }
});
