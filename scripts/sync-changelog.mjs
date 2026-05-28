#!/usr/bin/env node
// Mirror repo-root CHANGELOG.md → extensions/money-desk/data/CHANGELOG.md so
// the bundled `md_changelog` tool serves it at runtime. The installer copies
// everything under `extensions/money-desk/`, so the mirror is what ships to
// users when they run `npx money-desk install`.
//
// Wired into `npm pretest` and `prepublishOnly`. The companion test
// `tests/changelog-sync.test.mjs` asserts the two copies are byte-identical
// so drift cannot slip in.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const SRC = resolve(REPO, "CHANGELOG.md");
const DEST = resolve(REPO, "extensions", "money-desk", "data", "CHANGELOG.md");

async function main() {
    const txt = await readFile(SRC, "utf8");
    await mkdir(dirname(DEST), { recursive: true });
    let prior = null;
    try { prior = await readFile(DEST, "utf8"); } catch { /* first run */ }
    if (prior === txt) {
        console.log(`changelog already in sync (${txt.length} bytes)`);
        return;
    }
    await writeFile(DEST, txt, "utf8");
    console.log(`synced CHANGELOG.md → ${DEST} (${txt.length} bytes)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
