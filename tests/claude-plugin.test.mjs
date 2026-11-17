// Claude plugin / Claude Desktop packaging checks.
//
//   1. .claude-plugin/plugin.json, marketplace.json and the MCPB manifest.json
//      versions all equal package.json "version".
//   2. .mcp.json and manifest.json point at the MCP server that actually exists.
//   3. The stdio MCP server completes an initialize handshake, lists exactly
//      the tools registry.mjs exports, and serves a gated skill call.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const readJson = (p) => JSON.parse(readFileSync(resolve(REPO, p), "utf8"));

const pkg = readJson("package.json");
const plugin = readJson(".claude-plugin/plugin.json");
const marketplace = readJson(".claude-plugin/marketplace.json");
const mcpb = readJson("manifest.json");
const mcpJson = readJson(".mcp.json");
const SERVER = resolve(REPO, "extensions/money-desk/mcp-server.mjs");

test("plugin / marketplace / MCPB versions match package.json", () => {
    assert.equal(plugin.version, pkg.version, ".claude-plugin/plugin.json version");
    assert.equal(mcpb.version, pkg.version, "manifest.json version");
    const entry = marketplace.plugins.find((p) => p.name === plugin.name);
    assert.ok(entry, "marketplace.json lists the plugin");
    assert.equal(entry.version, pkg.version, "marketplace.json plugin version");
    assert.equal(entry.source, "./");
});

test("MCP configs point at the bundled server", () => {
    assert.ok(existsSync(SERVER), "mcp-server.mjs exists");
    const args = mcpJson.mcpServers["money-desk"].args;
    assert.deepEqual(args, ["${CLAUDE_PLUGIN_ROOT}/extensions/money-desk/mcp-server.mjs"]);
    assert.ok(existsSync(resolve(REPO, mcpb.server.entry_point)), "manifest.json entry_point exists");
    assert.ok(existsSync(resolve(REPO, "skills/money-desk/SKILL.md")), "router skill exists");
});

function rpc(messages) {
    return new Promise((resolvePromise, reject) => {
        const child = spawn(process.execPath, [SERVER], { stdio: ["pipe", "pipe", "pipe"] });
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
