# Agent Instructions

## Project Skills

Before broad codebase exploration in this project, load and follow the local GrepAI-first skill:

- `.codex/skills/grepai-first/SKILL.md`

Use it for exploring, explaining, debugging, reviewing, refactoring, or implementing changes when the relevant files are not already known.

## Breaking Change Policy

- Assume this package is already widely consumed and do not introduce breaking changes unless the user explicitly requests them.
- If a request would require a breaking change, or if a breaking change is a likely consequence of the requested functionality, stop and ask the user for confirmation before implementing it.
- When a breaking change is approved and implemented, document it in both `README.md` and `CHANGELOG.md` as part of the same change.
