# Security Policy

## Supported Versions

Only the latest minor version of `money-desk` receives security fixes.
At this stage of the project that is the `0.19.x` series.

| Version | Supported          |
| ------- | ------------------ |
| 0.19.x  | ✅                 |
| < 0.19  | ❌                 |

## Reporting a Vulnerability

**Please do NOT open public GitHub issues for security vulnerabilities.**

If you believe you have found a security issue in `money-desk` — for example:

- A prompt-injection vector inside a specialist or skill markdown that
  could cause the agent to ignore its guardrails (analysis-only,
  PII-masking, citation requirement).
- A path traversal or arbitrary-file-write in `bin/cli.mjs`.
- A way for the installer to escape the intended install directory.
- An injection vector in any future generated content.
- Any way Money Desk could exfiltrate user data beyond the normal
  Copilot CLI ↔ Copilot model service flow described in
  [PRIVACY.md](./PRIVACY.md).

…please report it privately using GitHub's
**[private vulnerability reporting](https://github.com/dmauser/money-desk/security/advisories/new)**
feature.

Include in your report:

- A description of the issue and its impact.
- Steps to reproduce, or a minimal proof of concept.
- The affected version(s) and environment (OS, Node version,
  Copilot CLI version).
- Your suggested remediation if you have one.

## What to expect

- **Acknowledgement:** within 7 days.
- **Initial assessment:** within 14 days.
- **Patch + advisory:** as fast as the severity warrants.
  Coordinated disclosure preferred.

## Scope notes

This project ships **prompts and a thin SDK adapter** — there is no
server, no database, no network code, and no runtime dependencies.
The supply-chain attack surface is therefore very small. The most
likely class of security issue is **prompt-level**: a specialist or
skill markdown that allows a crafted input document to override the
agent's guardrails. Reports of that kind are very welcome.

For privacy concerns that are not strictly security vulnerabilities,
please open a normal GitHub issue or PR — see [PRIVACY.md](./PRIVACY.md).
