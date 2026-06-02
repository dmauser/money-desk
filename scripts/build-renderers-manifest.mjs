#!/usr/bin/env node
/**
 * Generate `extensions/money-desk/renderers/RENDERERS_MANIFEST.json` so
 * the bundled manifest stays in lockstep with the renderer source.
 *
 * Run from `pretest` (and therefore `prepublishOnly`):
 *   1. Reads `package.json` for the canonical version string.
 *   2. For each tracked renderer, regex-rewrites `__renderer_version__ =
 *      "X.Y.Z"` (if present) so every Python file declares the same
 *      version as the package.
 *   3. Computes sha256 + bytes for each file.
 *   4. Writes the manifest with sorted keys + ISO-8601 `generated_at`.
 *
 * Zero runtime deps; uses node:crypto / node:fs/promises only.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const RENDERERS = resolve(REPO, "extensions", "money-desk", "renderers");

// Files we ship + sync. New renderers must be added here AND get a
// __renderer_version__ block (see test_renderers_manifest.py).
const TRACKED = [
    "_branded.py",
    "make_docx.py",
    "make_html.py",
    "make_pdf.py",
    "make_xlsx.py",
];

const VERSION_LINE_RE = /^(__renderer_version__\s*=\s*)"[^"]*"\s*$/m;

async function main() {
    const pkg = JSON.parse(await readFile(join(REPO, "package.json"), "utf8"));
    const version = pkg.version;
    if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
        throw new Error(`build-renderers-manifest: bad package.json version: ${version}`);
    }

    const files = {};
    for (const name of TRACKED) {
        const path = join(RENDERERS, name);
        let body = await readFile(path, "utf8");

        // Sync the embedded version string (when the file declares one).
        if (VERSION_LINE_RE.test(body)) {
            const updated = body.replace(VERSION_LINE_RE, `$1"${version}"`);
            if (updated !== body) {
                await writeFile(path, updated, "utf8");
                body = updated;
            }
        }

        const buf = Buffer.from(body, "utf8");
        const sha256 = createHash("sha256").update(buf).digest("hex");
        files[name] = { sha256, bytes: buf.length };
    }

    // Sort the keys deterministically.
    const sorted = {};
    for (const k of Object.keys(files).sort()) sorted[k] = files[k];

    const manifest = {
        extension_version: version,
        generated_at: new Date().toISOString(),
        files: sorted,
    };

    const out = join(RENDERERS, "RENDERERS_MANIFEST.json");
    // Trailing newline so editors don't fight us.
    await writeFile(out, JSON.stringify(manifest, null, 2) + "\n", "utf8");

    const rel = relative(REPO, out).replaceAll("\\", "/");
    console.log(`build-renderers-manifest: wrote ${rel} (v${version}, ${TRACKED.length} files)`);
}

main().catch((err) => {
    console.error(`build-renderers-manifest: ${err.message}`);
    process.exit(1);
});
