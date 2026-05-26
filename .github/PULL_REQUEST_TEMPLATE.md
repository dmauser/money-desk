<!--
Thanks for contributing to money-desk! A few quick checks before you submit.
Redact any real personal financial data from prompts/screenshots in this PR.
-->

## Summary

<!-- One or two sentences: what does this PR change and why? -->

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New specialist or new skill
- [ ] Change to existing specialist / skill content
- [ ] Tooling / installer / CI
- [ ] Documentation only
- [ ] Other:

## Checklist

- [ ] `npm test` passes locally (all tests, including `guardrails` and `docs-sync`).
- [ ] If I added or renamed a specialist/skill: I ran `npm run docs:capabilities`
      and committed the updated `docs/CAPABILITIES.md`.
- [ ] If I added a specialist: I also added a canonical phrase to
      `tests/routes.test.mjs` covering the route regex.
- [ ] I have NOT removed or weakened the `[UNSOURCED]` citation guardrail
      from any orchestrator or role markdown.
- [ ] I have NOT introduced runtime dependencies (Node built-ins only).
- [ ] I have NOT included real personal financial data in this PR (prompts,
      screenshots, fixtures must be synthetic or redacted).

## Reviewer notes

<!-- Anything reviewers should pay particular attention to. -->
