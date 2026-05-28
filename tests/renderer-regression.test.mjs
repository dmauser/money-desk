// Regression guard for the report renderers (make_pdf.py / make_html.py /
// make_docx.py). Two bugs were once visible in section 5 of generated reports:
//
//   1. Long narrative cells overflowed adjacent table columns in the PDF
//      because Chromium auto-sized columns without an overflow-wrap rule.
//   2. HTML entity references (`&mdash;`, `&times;`, ...) surfaced literally
//      in the PDF/DOCX because markdown2 / markdown-it-py do not decode
//      entity references inside table-cell content - and LLM-emitted markdown
//      sometimes carries backslash-escaped (`\&mdash;`) or double-encoded
//      (`&amp;mdash;`) forms that the browser cannot recover either.
//
// The fix is in the renderer sources: a shared `decode_entities` pre-pass
// on the markdown input, plus CSS `overflow-wrap` / `word-break` on table
// cells. These tests are structural (CI is Node-only, no Python) and exist
// to make sure nobody silently strips the fix during a future refactor.

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RENDERERS = join(__dirname, "..", "extensions", "money-desk", "renderers");

async function readRenderer(name) {
    return readFile(join(RENDERERS, name), "utf8");
}

for (const script of ["make_pdf.py", "make_html.py", "make_docx.py"]) {
    test(`${script}: entity-decoding helper is present and invoked`, async () => {
        const src = await readRenderer(script);
        assert.match(src, /def decode_entities\(text: str\) -> str:/,
            `${script} must define decode_entities() to normalize &mdash; / \\&mdash; / &amp;mdash; before rendering`);
        // The helper must actually be called on the markdown input.
        assert.match(src, /decode_entities\(\s*md_text\s*\)/,
            `${script} must invoke decode_entities(md_text) so the pre-pass actually runs`);
        // Stable-loop guards against double-encoded entities like &amp;mdash;.
        assert.match(src, /for _ in range\(\s*3\s*\)\s*:/,
            `${script}.decode_entities must loop until stable to handle double-encoded entities`);
    });
}

for (const script of ["make_pdf.py", "make_html.py"]) {
    test(`${script}: table cells have overflow-wrap rule (no column-overrun in PDF)`, async () => {
        const src = await readRenderer(script);
        // Both <td> and <th> must wrap, otherwise long unbreakable narrative
        // tokens render past the cell into the next column.
        const tdRule = /tbody td\s*\{[^}]*overflow-wrap:\s*anywhere[^}]*word-break:\s*break-word[^}]*\}/;
        const thRule = /thead th\s*\{[^}]*overflow-wrap:\s*anywhere[^}]*word-break:\s*break-word[^}]*\}/;
        assert.match(src, tdRule,
            `${script}: tbody td CSS must include overflow-wrap: anywhere and word-break: break-word`);
        assert.match(src, thRule,
            `${script}: thead th CSS must include overflow-wrap: anywhere and word-break: break-word`);
    });
}
