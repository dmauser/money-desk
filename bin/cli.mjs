#!/usr/bin/env node

import { cp, rm, mkdir, access, readdir, readFile, appendFile, writeFile } from "node:fs/promises";
import { resolve, join, dirname, sep, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir, platform } from "node:os";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, "..");
const EXTENSION_SRC = join(PKG_ROOT, "extensions", "money-desk");
const SPECIALISTS_SRC = join(EXTENSION_SRC, "specialists");
const COPILOT_DIR = join(homedir(), ".copilot");
const EXT_DEST = join(COPILOT_DIR, "extensions", "money-desk");

const GITIGNORE_ENTRY = ".github/extensions/money-desk/";

const ALLOWED_EXTENSIONS = new Set([".md", ".mjs", ".py", ".txt", ".json", ".yaml", ".yml"]);
// Path segments to skip entirely (developer/CI artifacts that don't belong in user installs).
const EXCLUDED_SEGMENTS = new Set(["tests", "__pycache__", ".pytest_cache"]);

function _isExcluded(path) {
    return path.split(/[\\/]/).some((seg) => EXCLUDED_SEGMENTS.has(seg));
}

async function getSpecialistNames() {
    try {
        const entries = await readdir(SPECIALISTS_SRC, { withFileTypes: true });
        return entries.filter((d) => d.isDirectory()).map((d) => d.name);
    } catch {
        return [];
    }
}

async function getPackageVersion() {
    try {
        const pkg = JSON.parse(await readFile(join(PKG_ROOT, "package.json"), "utf8"));
        return pkg.version ?? "unknown";
    } catch {
        return "unknown";
    }
}

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const log = (msg) => console.log(msg);
const ok = (msg) => log(`${GREEN}✓${RESET} ${msg}`);
const err = (msg) => log(`${RED}✗${RESET} ${msg}`);
const warn = (msg) => log(`${YELLOW}!${RESET} ${msg}`);
const info = (msg) => log(`${DIM}${msg}${RESET}`);

async function exists(path) {
    try { await access(path); return true; } catch { return false; }
}

function normalizePath(p) {
    if (!p) return p;
    return platform() === "win32" ? p.replaceAll("/", sep) : p;
}

function runGit(args, opts = {}) {
    const result = spawnSync("git", args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        shell: false,
        ...opts,
    });
    if (result.status !== 0) return null;
    return (result.stdout || "").trim();
}

function findGitRoot(cwd = process.cwd()) {
    const out = runGit(["rev-parse", "--show-toplevel"], { cwd });
    return out ? normalizePath(out) : null;
}

function findCopilotBinary() {
    const cmd = platform() === "win32" ? "where" : "which";
    const r = spawnSync(cmd, ["copilot"], { encoding: "utf8", shell: false });
    if (r.status !== 0) return null;
    const first = (r.stdout || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean)[0];
    return first || null;
}

// ── Hash-based idempotency ──────────────────────────────────────────────

async function hashTree(root) {
    const hash = createHash("sha256");
    if (!(await exists(root))) return null;
    await walk(root, async (file, rel) => {
        const data = await readFile(file);
        hash.update(rel.replaceAll(sep, "/"));
        hash.update("\0");
        hash.update(data);
        hash.update("\0");
    });
    return hash.digest("hex");
}

async function walk(root, visit) {
    const stack = [root];
    const files = [];
    while (stack.length) {
        const cur = stack.pop();
        const entries = await readdir(cur, { withFileTypes: true });
        for (const e of entries) {
            const p = join(cur, e.name);
            if (e.isDirectory()) {
                if (EXCLUDED_SEGMENTS.has(e.name)) continue;
                stack.push(p);
            } else if (e.isFile()) {
                files.push(p);
            }
        }
    }
    files.sort();
    for (const p of files) {
        const rel = p.slice(root.length + 1);
        if (!ALLOWED_EXTENSIONS.has(extname(p))) continue;
        await visit(p, rel);
    }
}

// ── Install primitives (honour --dry-run) ───────────────────────────────

const ctx = { dryRun: false };

async function _cp(src, dest) {
    if (ctx.dryRun) { info(`  [dry-run] copy ${src} → ${dest}`); return; }
    await cp(src, dest, {
        recursive: true,
        filter: (s) => {
            try {
                if (_isExcluded(s)) return false;
                if (!extname(s)) return true;
                return ALLOWED_EXTENSIONS.has(extname(s));
            } catch {
                return true;
            }
        },
    });
}

async function _rm(path) {
    if (ctx.dryRun) { info(`  [dry-run] remove ${path}`); return; }
    await rm(path, { recursive: true, force: true });
}

async function _mkdir(path) {
    if (ctx.dryRun) { info(`  [dry-run] mkdir -p ${path}`); return; }
    await mkdir(path, { recursive: true });
}

async function _writeFile(path, body) {
    if (ctx.dryRun) { info(`  [dry-run] write ${path}`); return; }
    await writeFile(path, body);
}

async function _appendFile(path, body) {
    if (ctx.dryRun) { info(`  [dry-run] append ${path}`); return; }
    await appendFile(path, body);
}

// ── Commands ────────────────────────────────────────────────────────────

async function addToGitignore(repoRoot) {
    const gitignorePath = join(repoRoot, ".gitignore");
    try {
        const content = await readFile(gitignorePath, "utf8");
        if (content.includes(GITIGNORE_ENTRY)) return;
        const separator = content.endsWith("\n") ? "" : "\n";
        await _appendFile(gitignorePath, `${separator}\n# Money Desk extension (installed per-developer)\n${GITIGNORE_ENTRY}\n`);
    } catch {
        await _writeFile(gitignorePath, `# Money Desk extension (installed per-developer)\n${GITIGNORE_ENTRY}\n`);
    }
    ok(`Added ${GITIGNORE_ENTRY} to .gitignore`);
}

async function initProject() {
    log("");
    log(`${CYAN}Money Desk${RESET} — installing extensions (project-level)${ctx.dryRun ? `  ${DIM}[dry-run]${RESET}` : ""}`);
    log("");

    const repoRoot = findGitRoot();
    const projectRoot = repoRoot || normalizePath(process.cwd());

    if (!repoRoot) {
        info("Not inside a git repository — initializing one...");
        if (ctx.dryRun) {
            info(`  [dry-run] git init in ${projectRoot}`);
        } else {
            const r = spawnSync("git", ["init"], { cwd: projectRoot, stdio: "ignore", shell: false });
            if (r.status !== 0) {
                err(`Failed to initialize git repository in ${projectRoot}`);
                process.exit(1);
            }
        }
        ok(`Initialized git repository in ${projectRoot}`);
    }

    const projectDest = join(projectRoot, ".github", "extensions", "money-desk");

    if (await exists(projectDest)) {
        const [srcHash, destHash] = await Promise.all([hashTree(EXTENSION_SRC), hashTree(projectDest)]);
        if (srcHash && srcHash === destHash) {
            ok("Already up to date — installed copy matches source.");
            await addToGitignore(projectRoot);
            printProjectScopeNote();
            return;
        }
        info("Existing project-level installation found — replacing...");
        await _rm(projectDest);
    }

    await _mkdir(join(projectRoot, ".github", "extensions"));
    await _cp(EXTENSION_SRC, projectDest);
    ok("Extension installed to .github/extensions/money-desk/");

    await addToGitignore(projectRoot);

    if (!ctx.dryRun) {
        const specialistsDir = join(projectDest, "specialists");
        if (await exists(specialistsDir)) {
            const specialists = (await readdir(specialistsDir, { withFileTypes: true }))
                .filter((d) => d.isDirectory())
                .map((d) => d.name);
            ok(`${specialists.length} specialists loaded: ${specialists.join(", ")}`);
        }
    }

    printProjectScopeNote();
}

function printProjectScopeNote() {
    log("");
    log("Get started:");
    log("");
    log(`  ${DIM}# Launch Copilot from this repo (no experimental mode needed):${RESET}`);
    log(`  copilot`);
    log("");
    log(`  ${DIM}# The extension loads automatically from .github/extensions/${RESET}`);
    log("");
    warn(`This is a ${CYAN}per-developer${RESET} install. The .gitignore rule keeps`);
    warn(`.github/extensions/money-desk/ out of git so the team is NOT forced to`);
    warn(`adopt money-desk by your commit. Each contributor must run`);
    warn(`'money-desk init --project' (or 'init' for user-level) themselves.`);
    log("");
}

async function init() {
    log("");
    log(`${CYAN}Money Desk${RESET} — installing extensions${ctx.dryRun ? `  ${DIM}[dry-run]${RESET}` : ""}`);
    log("");

    const extDir = join(COPILOT_DIR, "extensions");
    await _mkdir(extDir);

    const SPECIALIST_NAMES = await getSpecialistNames();
    let removed = 0;
    for (const name of SPECIALIST_NAMES) {
        const p = join(extDir, name);
        if (await exists(p)) {
            await _rm(p);
            removed++;
        }
    }
    if (removed > 0) {
        ok(`Removed ${removed} individual specialist extension(s) (replaced by bundle)`);
    }

    if (await exists(EXT_DEST)) {
        const [srcHash, destHash] = await Promise.all([hashTree(EXTENSION_SRC), hashTree(EXT_DEST)]);
        if (srcHash && srcHash === destHash) {
            ok("Already up to date — installed copy matches source.");
            printUserScopeNote();
            return;
        }
        info("Existing installation found — replacing...");
        await _rm(EXT_DEST);
    }

    await _cp(EXTENSION_SRC, EXT_DEST);
    ok("Extension installed to ~/.copilot/extensions/money-desk/");

    if (!ctx.dryRun) {
        const specialistsDir = join(EXT_DEST, "specialists");
        if (await exists(specialistsDir)) {
            const specialists = (await readdir(specialistsDir, { withFileTypes: true }))
                .filter((d) => d.isDirectory())
                .map((d) => d.name);
            ok(`${specialists.length} specialists loaded: ${specialists.join(", ")}`);
        }
    }

    printUserScopeNote();
}

function printUserScopeNote() {
    log("");
    log("Get started:");
    log("");
    log(`  ${DIM}# Launch Copilot with experimental mode (required for user-level extensions):${RESET}`);
    log(`  copilot --experimental`);
    log("");
    log(`  ${DIM}# Or install per-project instead (no experimental mode needed):${RESET}`);
    log(`  money-desk init --project`);
    log("");
}

async function uninstall() {
    const isProject = process.argv.includes("--project");

    log("");
    log(`${CYAN}Money Desk${RESET} — uninstalling${isProject ? " (project-level)" : ""}${ctx.dryRun ? `  ${DIM}[dry-run]${RESET}` : ""}`);
    log("");

    if (isProject) {
        const repoRoot = findGitRoot();
        if (!repoRoot) {
            err("Not inside a git repository.");
            info("  'uninstall --project' must be run from inside the git repo where you");
            info("  previously ran 'money-desk init --project'. cd into the repo, or run");
            info("  'money-desk uninstall' (no --project) to remove the user-level install.");
            process.exit(1);
        }
        const projectDest = join(repoRoot, ".github", "extensions", "money-desk");
        if (await exists(projectDest)) {
            await _rm(projectDest);
            ok("Removed .github/extensions/money-desk/");
            info("  (The .gitignore entry was left in place so a teammate's accidental");
            info("   reinstall stays out of git. Remove it manually if you no longer want it.)");
        } else {
            info("No project-level installation found in this repo — nothing to remove.");
        }
    } else {
        if (await exists(EXT_DEST)) {
            await _rm(EXT_DEST);
            ok("Removed ~/.copilot/extensions/money-desk/");
        } else {
            info("Not installed at the user level — nothing to remove.");
            info("  (Use 'money-desk uninstall --project' to remove a project-level install.)");
        }

        const extDir = join(COPILOT_DIR, "extensions");
        const SPECIALIST_NAMES = await getSpecialistNames();
        for (const name of SPECIALIST_NAMES) {
            const p = join(extDir, name);
            if (await exists(p)) {
                await _rm(p);
                ok(`Removed leftover: ${name}`);
            }
        }
    }
    log("");
}

async function status() {
    log("");
    log(`${CYAN}Money Desk${RESET} — status`);
    log("");

    let found = false;

    if (await exists(EXT_DEST)) {
        found = true;
        ok("User-level: installed at ~/.copilot/extensions/money-desk/");
        info("  Requires: copilot --experimental");

        const specialistsDir = join(EXT_DEST, "specialists");
        if (await exists(specialistsDir)) {
            const specialists = (await readdir(specialistsDir, { withFileTypes: true }))
                .filter((d) => d.isDirectory());
            ok(`  ${specialists.length} specialists available`);
            for (const s of specialists) {
                info(`    • ${s.name}`);
            }
        }

        const extDir = join(COPILOT_DIR, "extensions");
        const SPECIALIST_NAMES = await getSpecialistNames();
        const conflicts = [];
        for (const name of SPECIALIST_NAMES) {
            if (await exists(join(extDir, name))) conflicts.push(name);
        }
        if (conflicts.length > 0) {
            err(`  ${conflicts.length} conflicting individual extension(s) found — run 'money-desk init' to fix`);
        }
    }

    const repoRoot = findGitRoot();
    if (repoRoot) {
        const projectDest = join(repoRoot, ".github", "extensions", "money-desk");
        if (await exists(projectDest)) {
            found = true;
            ok(`Project-level: installed at .github/extensions/money-desk/`);
            info("  Works without experimental mode");

            const specialistsDir = join(projectDest, "specialists");
            if (await exists(specialistsDir)) {
                const specialists = (await readdir(specialistsDir, { withFileTypes: true }))
                    .filter((d) => d.isDirectory());
                ok(`  ${specialists.length} specialists available`);
            }
        }
    }

    if (!found) {
        err("Not installed. Run: money-desk init");
        info("  User-level:    money-desk init");
        info("  Project-level: money-desk init --project");
    }

    log("");
    const copilotPath = findCopilotBinary();
    if (copilotPath) {
        ok(`Copilot CLI found at: ${copilotPath}`);
        if (found) {
            info("  User-level installs need: copilot --experimental");
            info("  Project-level installs need only: copilot");
        }
    } else {
        warn("Copilot CLI not found on PATH.");
        info("  Install it with: npm install -g @github/copilot");
    }
    log("");
}

function showHelp() {
    log("");
    log(`${CYAN}Money Desk${RESET} — your personal-finance AI team`);
    log("");
    log("Usage: money-desk <command> [options]");
    log("");
    log("Commands:");
    log("  init                 Install to ~/.copilot/extensions/ (requires experimental mode)");
    log("  init --project       Install to .github/extensions/ in current repo (no experimental mode)");
    log("  uninstall            Remove user-level extensions");
    log("  uninstall --project  Remove project-level extensions from current repo");
    log("  status               Check installation status (both scopes) + detect copilot CLI");
    log("  --version, -v        Show the installed package version");
    log("  help                 Show this help");
    log("");
    log("Global flags:");
    log("  --dry-run            Print what would be copied / removed without touching disk");
    log("                       (works with 'init', 'init --project', 'uninstall', 'uninstall --project')");
    log("");
    log("Privacy: this CLI does not collect telemetry. Your financial data stays on your machine.");
    log("");
}

async function showVersion() {
    log(await getPackageVersion());
}

// ── Main ────────────────────────────────────────────────────────────────

const allArgs = process.argv.slice(2);
ctx.dryRun = allArgs.includes("--dry-run");
const positional = allArgs.filter((a) => !a.startsWith("-"));
const command = positional[0];

switch (command) {
    case "init":
        if (allArgs.includes("--project")) {
            await initProject();
        } else {
            await init();
        }
        break;
    case "uninstall":
    case "remove":
        await uninstall();
        break;
    case "status":
        await status();
        break;
    case undefined:
        if (allArgs.includes("--version") || allArgs.includes("-v")) {
            await showVersion();
            break;
        }
        showHelp();
        break;
    case "version":
    case "--version":
    case "-v":
        await showVersion();
        break;
    case "help":
    case "--help":
    case "-h":
        showHelp();
        break;
    default:
        err(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
}
