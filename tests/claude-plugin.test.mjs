// Claude plugin / Claude Desktop packaging checks.
//
//   1. The generated plugin (plugins/money-desk/), marketplace.json and the
//      MCPB manifest.json versions all equal package.json "version".
//   2. The marketplace points at the plugin subfolder (claude.ai's sync
//      rejects repo-root plugins), and the generated plugin is up to date.
//   3. The plugin's .mcp.json and manifest.json point at servers that exist.
//   4. The generated plugin's stdio MCP server completes an initialize
//      handshake, lists exactly the tools registry.mjs exports, and serves
//      a gated skill call.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const readJson = (p) => JSON.parse(readFileSync(resolve(REPO, p), "utf8"));

const pkg = readJson("package.json");
const PLUGIN_DIR = "plugins/money-desk";
const plugin = readJson(`${PLUGIN_DIR}/.claude-plugin/plugin.json`);
const marketplace = readJson(".claude-plugin/marketplace.json");
const mcpb = readJson("manifest.json");
const mcpJson = readJson(`${PLUGIN_DIR}/.mcp.json`);
const SERVER = resolve(REPO, PLUGIN_DIR, "runtime/mcp-server.mjs");

test("plugin / marketplace / MCPB versions match package.json", () => {
    assert.equal(plugin.version, pkg.version, "plugins/money-desk/.claude-plugin/plugin.json version");
    assert.equal(mcpb.version, pkg.version, "manifest.json version");
    const entry = marketplace.plugins.find((p) => p.name === plugin.name);
    assert.ok(entry, "marketplace.json lists the plugin");
    assert.equal(entry.version, pkg.version, "marketplace.json plugin version");
    assert.equal(entry.source, `./${PLUGIN_DIR}`, "plugin must live in a subfolder, not the repo root");
    assert.ok(!existsSync(resolve(REPO, ".claude-plugin/plugin.json")), "no root-level plugin.json (breaks claude.ai sync)");
});

test("generated plugin is up to date with its sources", () => {
    const r = spawnSync(process.execPath, [resolve(REPO, "scripts/build-claude-plugin.mjs"), "--check"], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
});

test("MCP configs point at the bundled server", () => {
    assert.ok(existsSync(SERVER), "plugin runtime/mcp-server.mjs exists");
    const args = mcpJson.mcpServers["money-desk"].args;
    assert.deepEqual(args, ["${CLAUDE_PLUGIN_ROOT}/runtime/mcp-server.mjs"]);
    assert.ok(existsSync(resolve(REPO, mcpb.server.entry_point)), "manifest.json entry_point exists");
    assert.ok(existsSync(resolve(REPO, PLUGIN_DIR, "skills/money-desk/SKILL.md")), "router skill exists");
});

function rpc(messages, env = {}) {
    return new Promise((resolvePromise, reject) => {
        const child = spawn(process.execPath, [SERVER], { stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, ...env } });
        let out = "";
        child.stdout.on("data", (c) => (out += c));
        child.on("error", reject);
        child.on("close", () => {
            try {
                const byId = new Map();
                for (const line of out.trim().split("\n").filter(Boolean)) {
                    const m = JSON.parse(line);
                    byId.set(m.id, m);
                }
                resolvePromise(byId);
            } catch (err) {
                reject(err);
            }
        });
        child.stdin.end(messages.map((m) => JSON.stringify(m)).join("\n") + "\n");
    });
}

test("MCP server handshake, tools/list and a gated skill call", async () => {
    const { tools } = await import("../extensions/money-desk/registry.mjs");
    const res = await rpc([
        { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } } },
        { jsonrpc: "2.0", method: "notifications/initialized" },
        { jsonrpc: "2.0", id: 2, method: "tools/list" },
        { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "md_bc_skill_monthly_plan", arguments: {} } },
        { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "does_not_exist", arguments: {} } },
    ]);

    const init = res.get(1).result;
    assert.equal(init.protocolVersion, "2025-06-18");
    assert.equal(init.serverInfo.version, pkg.version);
    assert.match(init.instructions, /md_capabilities/);

    const listed = res.get(2).result.tools;
    assert.deepEqual(listed.map((t) => t.name).sort(), tools.map((t) => t.name).sort());
    for (const t of listed) assert.equal(t.inputSchema.type, "object", `${t.name} inputSchema`);

    const gated = res.get(3).result;
    assert.notEqual(gated.isError, true);
    assert.match(gated.content[0].text, /intake required/);

    assert.equal(res.get(4).error.code, -32602);
});

test("compact mode lists discovery tools + md_call and dispatches by id", async () => {
    const { tools } = await import("../extensions/money-desk/registry.mjs");
    const call = (id, args) => ({ jsonrpc: "2.0", id, method: "tools/call", params: { name: "md_call", arguments: args } });
    const res = await rpc(
        [
            { jsonrpc: "2.0", id: 1, method: "tools/list" },
            call(2, { tool: "md_ds_skill_payoff_plan" }),
            call(3, { tool: "md_ds_skill_payoff_plan", inputs: { monthly_budget_usd: 900 } }),
            call(4, { tool: "md_tx_role" }),
            call(5, { tool: "md_facts" }),
            call(6, { tool: "../etc/passwd" }),
        ],
        { MONEY_DESK_TOOLS: "compact" },
    );
    const listed = res.get(1).result.tools.map((t) => t.name);
    const discovery = tools.map((t) => t.name).filter((n) => !/^md_[a-z]{2}_(role|orchestrate|skill_)/.test(n));
    assert.deepEqual(listed.sort(), [...discovery, "md_call"].sort());
    assert.match(res.get(2).result.content[0].text, /intake required/);
    assert.match(res.get(3).result.content[0].text, /Inputs received/);
    assert.notEqual(res.get(4).result.isError, true);
    assert.equal(res.get(5).result.isError, true, "md_call only dispatches specialist tools");
    assert.equal(res.get(6).result.isError, true);
});
