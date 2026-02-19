# Mycelia — TODO

Tasks are grouped by phase. Items marked **[MVP]** are required for the first public desktop release. Items marked **[CLOUD]** are for the subscription tier.

---

## Phase 1 — Desktop MVP (ship the $99 product)

### In progress / next up

- [ ] **[MVP] Full-text search** — `src/lib/search/indexer.ts` contains a complete BM25 implementation but it is not yet connected to the UI. The `/notes` page currently filters by filename substring only. Wire the `VaultIndex` into the notes store and the search input so results are ranked by BM25 score across note content.

- [ ] **[MVP] Multi-conversation support** — Add named conversations/sessions, each with its own chat history. Users need separate threads for work, personal, projects, etc.

- [ ] **[MVP] Ollama / local model integration** — Add support for local models via Ollama as the free tier backend. Users who don't want to pay for anything get a working product with llama/mistral. Model selection in settings alongside the Claude options.

- [ ] **[MVP] Settings validation** — Validate API key format on entry (starts with `sk-ant-`) and test it with a cheap API call before accepting. Show clear errors for invalid keys. Also validate Ollama connection when local model is selected.

### Core features

- [ ] **System tray** — Run Mycelia in the background. A tray icon lets the user open the window or start a quick capture without bringing up the full app.

- [ ] **Auto-update** — Implement `tauri-plugin-updater` so the app can update itself. Ship update manifests to a static hosting endpoint. Updates are free forever.

- [ ] **App icon and branding** — Replace placeholder Tauri icons with real Mycelia branding. Design a proper icon for macOS, Windows, and Linux.

- [ ] **Conversation export** — Export a conversation as markdown or plain text.

- [ ] **Wikilink navigation from graph** — Clicking a node in the graph view should navigate to that note's `/note/[path]` page. The Cytoscape click handler exists; verify it routes correctly and add a back button / breadcrumb.

---

## Phase 2 — MCP Integration (the Claude-native experience)

- [ ] **MCP server implementation** — Build an MCP server (Node sidecar or Rust native) that exposes the vault as MCP tools. Core tools to expose:
  - **File access**: read/write markdown notes in the vault
  - **Search/retrieval**: BM25 full-text search as a tool
  - **Graph traversal**: query wikilink relationships, find connected notes, traverse the knowledge graph
  - **Memory**: custom memory tools backed by the vault

- [ ] **MCP server auto-start** — The MCP server starts automatically with the Tauri app and registers itself so Claude.ai Desktop can discover and connect to it.

- [ ] **MCP tool schema design** — Design the tool schemas that Claude.ai will use to interact with the vault. Keep them simple and composable: `read_note`, `search_notes`, `list_notes`, `get_connections`, `write_note`, etc.

- [ ] **MCP documentation / onboarding** — Guide users through connecting Claude.ai Desktop to Mycelia's MCP server. In-app instructions and a setup wizard.

---

## Phase 3 — Cloud & Web (the subscription product)

- [ ] **[CLOUD] Auth system** — User accounts for the cloud tier. Email + password or OAuth. Required for sync, web access, and managed API.

- [ ] **[CLOUD] Sync infrastructure** — Bidirectional vault sync between desktop and cloud. CRDTs (Yjs or Automerge) for conflict resolution when two devices edit the same note. Backend storage on S3/R2/Supabase.

- [ ] **[CLOUD] Web interface** — A SvelteKit web app that provides the same vault, graph, and chat experience as the desktop app. Shares Svelte components with the Tauri frontend. Accessible from any browser or phone.

- [ ] **[CLOUD] Managed API backend** — Server-side Claude API integration for subscription users. Users get Claude without managing their own key. Needs usage metering and rate limiting.

- [ ] **[CLOUD] Mobile companion** — A minimal iOS/Android app or PWA that lets users chat with their vault, send quick notes, or capture voice memos. Targets the same synced vault.

---

## Quality and reliability

- [ ] **Better error handling** — Add a proper error log view and retry mechanism for failed writes. The background extraction and journal tasks currently only surface errors as dismissable toasts.

- [ ] **Extraction reliability** — The parser that splits Claude's output into note blocks is fragile. Add validation, better fallback handling, and logging of raw extraction responses for debugging.

- [ ] **Test coverage** — No tests exist. Add unit tests for the pure functions in `parser.ts`, `graph.ts`, `rag.ts`, and `indexer.ts`. Add integration tests for the extraction pipeline using fixture conversations.

- [ ] **TypeScript strictness** — `GraphView.svelte` uses Cytoscape + fcose. The fcose extension requires a manual type declaration (`src/types/cytoscape-fcose.d.ts`). Audit remaining `any` casts across the codebase.

- [ ] **Stale vault path handling** — If the vault directory is moved or deleted, the app shows a generic error. Improve this to guide the user through reselecting the vault.

- [ ] **Extraction deduplication** — The model sometimes creates duplicate notes for the same topic. Add a deduplication pass that compares filenames before writing.

- [ ] **BM25 index persistence** — Once wired up, the search index is rebuilt from scratch on every app load. For larger vaults, persist the index to disk and invalidate only changed files.

---

## Performance

- [ ] **Lazy vault loading** — `readAllNotes` loads all vault files into memory for RAG and backlink computation. Switch to streaming/chunked reads and build the BM25 index on a background thread.

- [ ] **Graph performance** — Cytoscape with fcose handles moderate graphs well but can become slow beyond a few hundred nodes. Add a node-count threshold that degrades gracefully (e.g., hide phantom nodes, switch to a simpler layout).

---

## Done

- [x] Chat interface with Claude API streaming
- [x] Configurable conversation and extraction models (Opus / Sonnet / Haiku)
- [x] Knowledge extraction with YAML frontmatter, wikilinks, and folder routing
- [x] Append mode for existing notes
- [x] Daily journal with timestamped entries
- [x] Graph visualization of wikilink connections (Cytoscape + fcose, replaces force-graph)
- [x] Color-coded graph nodes by folder
- [x] Phantom nodes for unresolved wikilinks
- [x] RAG retrieval via pattern detection and context stuffing
- [x] Settings page (API key, vault path, models, writing perspective)
- [x] First/second person writing perspective toggle
- [x] Onboarding wizard (2-step: API key + vault directory)
- [x] Chat persistence to `.mycelia/chat.json`
- [x] Vault folder structure initialization on first run
- [x] Obsidian-compatible markdown output
- [x] Background task error surfacing (toast)
- [x] Note browser (`/notes`) — folder explorer with filename-based search
- [x] Note viewer/editor (`/note/[...path]`) — Tiptap WYSIWYG editing + backlinks panel
- [x] Daily notes view (`/daily`) — calendar with journal entries
- [x] BM25 full-text search library (`src/lib/search/indexer.ts`) — implemented, wiring to UI is next
- [x] BackLinks component showing inbound wikilinks for any note
- [x] Calendar component for daily notes navigation
- [x] Notes store (`src/lib/stores/notes.ts`) — reactive vault state, backlink computation
