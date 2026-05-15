# Agent Instructions

## Project Skills

Use Serena as the primary tool for code navigation, symbol lookup, and symbol-aware edits in this repository.

If Serena is unavailable or not suitable for the task, fall back to standard approaches such as `rg`, direct file reads, and shell-based verification.

Before broad codebase exploration in this project, load and follow the local GrepAI-first skill:

- `.codex/skills/grepai-first/SKILL.md`

Use it for exploring, explaining, debugging, reviewing, refactoring, or implementing changes when the relevant files are not already known.

## Breaking Change Policy

- Assume this package is already widely consumed and do not introduce breaking changes unless the user explicitly requests them.
- If a request would require a breaking change, or if a breaking change is a likely consequence of the requested functionality, stop and ask the user for confirmation before implementing it.
- When a breaking change is approved and implemented, document it in both `README.md` and `CHANGELOG.md` as part of the same change.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **nest-js-warehouse** (213 symbols, 469 relationships, 3 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/nest-js-warehouse/context` | Codebase overview, check index freshness |
| `gitnexus://repo/nest-js-warehouse/clusters` | All functional areas |
| `gitnexus://repo/nest-js-warehouse/processes` | All execution flows |
| `gitnexus://repo/nest-js-warehouse/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |
| Work in the Internal area (14 symbols) | `.claude/skills/generated/internal/SKILL.md` |
| Work in the Test area (12 symbols) | `.claude/skills/generated/test/SKILL.md` |

<!-- gitnexus:end -->
