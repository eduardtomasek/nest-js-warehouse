---
name: grepai-first
description: Prefer GrepAI semantic search for codebase discovery in this project, with explicit fallback behavior when GrepAI, MCP, Ollama, or the index is unavailable. Use when exploring, explaining, debugging, reviewing, refactoring, or implementing changes in the nest-js-warehouse project.
---

# GrepAI First

## Purpose

For this project, use GrepAI semantic search before broad manual code exploration whenever the task needs codebase understanding. GrepAI semantic search is the preferred first pass for finding relevant files and code by intent.

Do not use GrepAI for trivial single-file edits where the target file and line are already known.

## Start With GrepAI When

- The user asks where logic lives, how something works, or what calls what.
- The task involves debugging behavior without a known exact file.
- The task needs architecture, module boundaries, dependencies, or domain flow.
- The task is a review, refactor, feature implementation, or regression diagnosis.
- The user mentions warehouse concepts, decorators, loaders, freeze policy, bootstrap, module options, or public/internal API surface.

## Preferred GrepAI Sequence

1. Check index health if freshness matters:
   - `grepai_index_status`
   - Continue if `total_chunks > 0`.
2. Use semantic search for intent:
   - `grepai_search` with a natural-language query.
   - Search for domain behavior, not only exact identifiers.
3. Confirm important findings with direct file reads before editing.

Do NOT use RPG tools (`grepai_rpg_search`, `grepai_rpg_fetch`, `grepai_rpg_explore`) or trace tools (`grepai_trace_callers`, `grepai_trace_callees`, `grepai_trace_graph`).

## If GrepAI Works But Results Are Weak

- Rephrase the query using project terms from the result set.
- Run a second `grepai_search` with a different angle on the same intent.
- Search by exact symbol with `rg` if semantic results are low-confidence.
- Read the top files directly before drawing conclusions.

## Failure Handling

### MCP Tool Unavailable Or Errors

If a GrepAI MCP call fails, times out, or returns a transport/server error:

1. Try one quick status call: `grepai_index_status`.
2. If status also fails, fall back immediately to local tools.
3. Do not block the task waiting for MCP unless the user explicitly asked to repair GrepAI.
4. Mention in the final answer that GrepAI MCP was unavailable and which fallback was used.

Fallback tools:

- `rg` / `rg --files` for exact search and file discovery.
- Direct file reads with `sed -n` or similar.
- TypeScript/Jest/NestJS commands already present in the repo for verification.

### Local Ollama Unavailable

Symptoms include connection failures to `127.0.0.1:11434` or `localhost:11434`, missing model errors, or sandbox `operation not permitted` when GrepAI CLI contacts Ollama.

1. If the task only needs existing index reads, continue with MCP if it still answers.
2. If Ollama is actually not running or the model is missing, do not repeatedly retry.
3. Fall back to `rg` and direct file reads.
4. Report the specific blocked dependency: Ollama endpoint, model, or sandbox permission.

### Empty Or Stale Index

If status shows `total_chunks: 0`:

1. If the user asked to initialize or refresh GrepAI, run `grepai watch` or `grepai watch --background` as appropriate.
2. If the task is unrelated to maintaining GrepAI, fall back to `rg` and file reads rather than stopping.
3. Mention that GrepAI was skipped because the index was empty or stale.

## Fallback Search Pattern

When falling back manually:

1. `rg --files` to understand project shape if needed.
2. `rg` for exact domain terms and exported symbols.
3. Read the smallest relevant files.
4. Use call/import relationships from code, not assumptions.
5. Run focused tests or type checks when behavior changed.

## Reporting

Keep user-facing reporting concise:

- State whether GrepAI was used successfully.
- If it failed, name the failure class: MCP, Ollama, empty index, stale index, or weak results.
- State the fallback path used.
- Do not over-explain GrepAI internals unless the user asks.
