# Mycelia — Project Context

## Overview

Mycelia (mycelia.garden) is a conversation-first personal knowledge base built as a local-first desktop app. The user chats with an AI; a second AI automatically extracts, organizes, and writes that conversation into an Obsidian-compatible markdown vault.

## Stack

- **Runtime**: Tauri v2 (Rust backend, WebView frontend)
- **Frontend**: SvelteKit + Svelte 5 + TypeScript + Tailwind CSS v4
- **AI**: Anthropic Claude API — direct browser access via `anthropic-dangerous-direct-browser-access: true` header (no proxy needed in Tauri context)
- **Graph**: force-graph (canvas-based force-directed visualization)
- **Persistence**: tauri-plugin-store (settings), tauri-plugin-fs (vault markdown files)
- **Package manager**: bun (never npm)

## Key constraints

- All vault output must be plain markdown with YAML frontmatter and `[[wikilinks]]` — Obsidian-compatible, no proprietary format.
- No Mycelia server. API calls go directly from the Tauri WebView to Anthropic. The user brings their own API key.
- Vault is a user-selected directory. The app must never assume a fixed path.
- Settings and chat history are local-only. Nothing leaves the machine except Anthropic API calls.

## Architecture decisions

- **Two-model design**: A larger conversational model (default: Sonnet) handles chat streaming; a faster, cheaper model (default: Haiku) handles background extraction and journal writes. Both are configurable independently.
- **Background tasks after each exchange**: `writeJournalEntry` and `extractKnowledge` run in parallel after every assistant response. Errors are surfaced as dismissable toasts but do not block the chat.
- **Context stuffing for RAG (current MVP)**: Retrieval queries are detected by regex pattern matching. When triggered, all vault notes are read and injected into the system prompt. This works for small vaults but will not scale — vector search is the intended replacement.
- **Extraction parser is prompt-dependent**: The note block format (`---` frontmatter, `===` separator) relies on Claude returning a specific structure. The parser is tolerant of whitespace variations but fragile to format changes. Handle with care.
- **Append semantics**: `writeNote` in `filesystem.ts` appends to an existing file rather than overwriting it. The extraction engine instructs the model to specify `mode: append` when an existing file should be updated.

## File layout (source only)

```
src/lib/ai/         — Claude client, extraction engine, RAG
src/lib/vault/      — Filesystem ops, graph builder, journal writer, markdown parser
src/lib/stores/     — Svelte stores for chat messages and settings
src/lib/components/ — UI components (chat, graph, sidebar, onboarding)
src/routes/         — SvelteKit pages (chat, graph, settings)
src-tauri/src/      — Rust: plugin registration only (lib.rs + main.rs)
```

## Active priorities (as of 2026-02-19)

1. Vector search to replace context stuffing (biggest architectural gap)
2. Note browser / viewer inside the app
3. Full-text vault search
4. Multi-conversation support
5. System tray + background mode

See TODO.md for the full task list.

## Known issues / gotchas

- `GraphView.svelte` uses `any` casts for the force-graph API — the library has no useful type definitions.
- The extraction parser splits on `===` as a note separator; if Claude includes `===` in note body content, blocks will be split incorrectly.
- `readAllNotes` loads the entire vault into memory synchronously — fine for small vaults, will be slow at scale.
- The Tauri capabilities file (`src-tauri/capabilities/default.json`) must explicitly grant filesystem permissions to the user's chosen vault directory. Ensure this is kept in sync with any new Tauri plugin additions.
