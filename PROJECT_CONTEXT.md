# Mycelia — Project Context

## Overview

Mycelia (mycelia.garden) is a conversation-first personal knowledge base. The user chats with an AI; a second AI automatically extracts, organizes, and writes that conversation into an Obsidian-compatible markdown vault.

The product ships as a local-first desktop app (Tauri) with an optional cloud tier that adds a web interface, cross-device sync, and managed AI. The desktop app also exposes an MCP server so Claude.ai Desktop can natively access the user's vault, graph, and RAG tools.

## Stack

- **Runtime**: Tauri v2 (Rust backend, WebView frontend)
- **Frontend**: SvelteKit + Svelte 5 + TypeScript + Tailwind CSS v4
- **AI**: Anthropic Claude API — direct browser access via `anthropic-dangerous-direct-browser-access: true` header (no proxy needed in Tauri context)
- **Graph**: Cytoscape.js + cytoscape-fcose layout (replaced force-graph as of 0.2.0)
- **Editor**: Tiptap v3 (WYSIWYG markdown editing in note viewer)
- **Search**: BM25 in-memory full-text index (`src/lib/search/indexer.ts`)
- **Markdown rendering**: `marked`
- **Persistence**: tauri-plugin-store (settings), tauri-plugin-fs (vault markdown files)
- **Package manager**: bun (never npm)

## Business model

- **Free**: Local model (Ollama), core vault + graph features, no account required
- **$99 one-time**: BYOK (user's own Anthropic key), full Claude access, all future updates free
- **Subscription**: Managed Claude API, cloud sync, web interface, MCP integration

## Key constraints

- All vault output must be plain markdown with YAML frontmatter and `[[wikilinks]]` — Obsidian-compatible, no proprietary format.
- Desktop app works fully offline with no account. API calls go directly from the Tauri WebView to Anthropic (BYOK) or to a local Ollama instance (free tier).
- Vault is a user-selected directory. The app must never assume a fixed path.
- Settings and chat history are local-only on the desktop tier. Cloud tier adds optional sync.
- MCP server exposes vault tools to Claude.ai Desktop — no API key needed for MCP users (they use their own Claude subscription).

## Architecture decisions

- **Two-model design**: A larger conversational model (default: Sonnet) handles chat streaming; a faster, cheaper model (default: Haiku) handles background extraction and journal writes. Both are configurable independently.
- **Background tasks after each exchange**: `writeJournalEntry` and `extractKnowledge` run in parallel after every assistant response. Errors are surfaced as dismissable toasts but do not block the chat.
- **BM25 full-text search (current)**: The `indexer.ts` module builds an in-memory BM25 index from all vault notes on app load. Results are ranked by relevance. This replaces the planned "simple grep-style scan" and satisfies the full-text search MVP requirement. Vector/embedding search is still the target for RAG retrieval.
- **Context stuffing for RAG (current MVP)**: Retrieval queries are detected by regex pattern matching. When triggered, all vault notes are read and injected into the system prompt. This works for small vaults but will not scale — vector search is the intended replacement.
- **Extraction parser is prompt-dependent**: The note block format (`---` frontmatter, `===` separator) relies on Claude returning a specific structure. The parser is tolerant of whitespace variations but fragile to format changes. Handle with care.
- **Append semantics**: `writeNote` in `filesystem.ts` appends to an existing file rather than overwriting it. The extraction engine instructs the model to specify `mode: append` when an existing file should be updated.
- **Cytoscape graph**: The graph view switched from `force-graph` (canvas) to Cytoscape.js with the fcose layout. Cytoscape has better type support and richer interaction (click to navigate, styled by folder). The `cytoscape-fcose` extension requires a manual type declaration (`src/types/cytoscape-fcose.d.ts`).
- **Notes store**: `src/lib/stores/notes.ts` is the central reactive store for vault note state — it manages the list of all notes, the BM25 index, and computed backlinks. Components should read notes from this store rather than calling filesystem ops directly.

## File layout (source only)

```
src/lib/ai/             — Claude client, extraction engine, RAG
src/lib/vault/          — Filesystem ops, graph builder, journal writer, markdown parser
src/lib/stores/         — Svelte stores (chat, settings, notes)
src/lib/search/         — BM25 full-text search index
src/lib/components/     — UI components (chat, graph, sidebar, onboarding, note viewer, editor)
src/routes/             — SvelteKit pages
  +page.svelte          — Chat view
  graph/                — Graph view (Cytoscape)
  notes/                — Note browser (folder explorer + BM25 search)
  note/[...path]/       — Note viewer/editor (Tiptap + backlinks)
  daily/                — Daily notes (calendar + infinite scroll)
  settings/             — Settings view
src-tauri/src/          — Rust: plugin registration only (lib.rs + main.rs)
src/types/              — Manual type declarations (cytoscape-fcose)
```

## Roadmap phases

**Phase 1 — Desktop MVP** (ship the $99 product): Vector search for RAG, multi-conversation support, Ollama integration, settings validation. Note browser and full-text search are now done.

**Phase 2 — MCP Integration**: Build and ship the MCP server so Claude.ai Desktop users get native vault access. Key differentiator — very few tools offer this yet.

**Phase 3 — Cloud & Web**: Auth, sync infrastructure (CRDTs), web interface (SvelteKit), managed API backend, mobile companion.

See TODO.md for the full task list.

## Known issues / gotchas

- `GraphView.svelte` uses Cytoscape with the `cytoscape-fcose` layout. The layout extension is registered globally via `cytoscape.use(fcose)` and requires the manual type declaration in `src/types/cytoscape-fcose.d.ts`.
- The extraction parser splits on `===` as a note separator; if Claude includes `===` in note body content, blocks will be split incorrectly.
- `readAllNotes` loads the entire vault into memory — the BM25 index is built from this. Fine for small vaults, will be slow at scale.
- The Tauri capabilities file (`src-tauri/capabilities/default.json`) must explicitly grant filesystem permissions to the user's chosen vault directory. Ensure this is kept in sync with any new Tauri plugin additions.
- Tiptap v3 is used for the WYSIWYG editor. The `tiptap-markdown` extension handles serialization back to markdown on save; be careful if upgrading Tiptap as the extension may lag behind.
- BM25 index is rebuilt in memory on every app load from `readAllNotes`. If the vault is large, consider persisting the index to disk or building it incrementally.
