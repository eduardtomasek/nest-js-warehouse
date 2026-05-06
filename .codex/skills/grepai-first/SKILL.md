---
name: grepai-first
description: Prefer GrepAI MCP for codebase discovery in this project, with explicit fallback behavior when GrepAI, MCP, Ollama, or indexes are unavailable. Use when exploring, explaining, debugging, reviewing, refactoring, or implementing changes in the nest-js-warehouse project.
---

# GrepAI First

## Purpose

For this project, try GrepAI before broad manual code exploration whenever the task needs codebase understanding. GrepAI is the preferred first pass for semantic search, RPG graph navigation, and symbol relationship discovery.

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
   - Continue if `total_chunks > 0`, `symbols_ready: true`, and RPG is available when graph traversal is useful.
2. Use semantic search for intent:
   - `grepai_search` with a natural-language query.
   - Search for domain behavior, not only exact identifiers.
3. Use RPG for structure:
   - `grepai_rpg_search` to find files, symbols, chunks, and feature paths.
   - `grepai_rpg_fetch` for a promising node.
   - `grepai_rpg_explore` when relationships matter.
4. Use trace tools for call relationships:
   - `grepai_trace_callers`, `grepai_trace_callees`, or `grepai_trace_graph`.
   - Prefer method/function names over class names when class-level traces return empty results.
5. Confirm important findings with direct file reads before editing.

## If GrepAI Works But Results Are Weak

- Rephrase the query using project terms from the result set.
- Try both semantic search and RPG search; they answer different questions.
- Search by exact symbol with `rg` if semantic results are low-confidence.
- Read the top files directly before drawing conclusions.
- Treat empty class-level callees as inconclusive; retry with concrete method/function symbols.

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
- Tree-sitter tools for syntax-level inspection when useful.
- TypeScript/Jest/NestJS commands already present in the repo for verification.

### Local Ollama Unavailable

Symptoms include connection failures to `127.0.0.1:11434` or `localhost:11434`, missing model errors, or sandbox `operation not permitted` when GrepAI CLI contacts Ollama.

1. If the task only needs existing index reads, continue with MCP if it still answers.
2. If indexing or `grepai watch` is required and the first sandboxed command fails with a local network error, rerun with escalated permissions.
3. If Ollama is actually not running or the model is missing, do not repeatedly retry.
4. Fall back to `rg` and direct file reads.
5. Report the specific blocked dependency: Ollama endpoint, model, or sandbox permission.

### Empty Or Stale Index

If status shows `total_chunks: 0`, `symbols_ready: false`, or RPG disabled/stale:

1. If the user asked to initialize or refresh GrepAI, run `grepai watch` or `grepai watch --background` as appropriate.
2. If `grepai watch` needs local Ollama and fails due to sandbox networking, request escalation.
3. If the task is unrelated to maintaining GrepAI, fall back to `rg` and file reads rather than stopping.
4. Mention that GrepAI was skipped because the index was empty or stale.

### Partial RPG Availability

If semantic search works but RPG is disabled or empty:

- Use semantic search for candidate files.
- Use `rg` for exact symbols and imports.
- Use direct reads to reconstruct relationships.
- Use trace tools only if `symbols_ready: true`.

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
