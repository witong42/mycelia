# Mycelia — TODO

Tasks are ordered roughly by priority. Items marked **[MVP]** are the most important for a first public release.

---

## In progress / next up

- [ ] **[MVP] Vector search for RAG** — Replace context stuffing with proper embedding-based retrieval. The current approach loads every note into the prompt, which works for small vaults but breaks down at scale. Store embeddings locally (sqlite-vec or similar) and retrieve only the top-K relevant chunks per query.

- [ ] **[MVP] Note browser / viewer** — Users can't read their vault inside the app right now. Add a notes panel that lists vault files by folder, lets you open and read them, and highlights wikilinks. Clicking a wikilink should navigate to that note.

- [ ] **[MVP] Full-text search** — Search across all vault markdown files by keyword. A simple grep-style scan is fine initially; can be replaced with indexed search later.

---

## Features

- [ ] **Multi-conversation support** — Right now there is one conversation. Add named conversations/sessions, each with its own chat history, so users can keep separate threads (work, personal, projects, etc.).

- [ ] **System tray** — Run Mycelia in the background. A tray icon lets the user open the window or start a quick capture without bringing up the full app.

- [ ] **Auto-update** — Implement `tauri-plugin-updater` so the app can update itself. Ship update manifests to a static hosting endpoint.

- [ ] **App icon and branding** — Replace the placeholder Tauri icons with real Mycelia branding. Design a proper icon for macOS, Windows, and Linux.

- [ ] **Mobile companion** — A minimal iOS/Android app or share extension that lets users send a note or voice memo to the Mycelia vault. Likely a separate project that targets the same vault format.

- [ ] **Note editing** — Allow the user to edit a note directly in the app. Edits write back to the markdown file on disk.

- [ ] **Wikilink navigation in graph** — Clicking a node in the graph view should open that note in a side panel rather than just logging to console.

- [ ] **Conversation export** — Export a conversation as markdown or plain text. Useful for archiving or sharing.

- [ ] **Vault sync** — Optional sync to a remote (iCloud, Dropbox, or git). The vault is already a plain folder so this may just be documentation, but a git-based auto-commit option would be useful.

---

## Quality and reliability

- [ ] **Better error handling** — The background extraction and journal tasks currently surface errors as a dismissable toast. Add a proper error log view and retry mechanism for failed writes.

- [ ] **Extraction reliability** — The parser that splits Claude's output into note blocks is fragile. Add validation, better fallback handling, and logging of raw extraction responses for debugging.

- [ ] **Test coverage** — No tests exist. Add unit tests for the pure functions in `parser.ts`, `graph.ts`, and `rag.ts` (retrieval pattern matching). Add integration tests for the extraction pipeline using fixture conversations.

- [ ] **TypeScript strictness** — Several `any` casts exist in `GraphView.svelte` due to the force-graph library's untyped API. Wrap the library with a typed adapter.

- [ ] **Settings validation** — Validate the API key format on entry (starts with `sk-ant-`) and test it with a cheap API call before accepting it. Show a clear error if the key is invalid.

- [ ] **Stale vault path handling** — If the vault directory is moved or deleted, the app shows a generic error. Improve this to guide the user through reselecting the vault.

- [ ] **Extraction deduplication** — The model sometimes creates duplicate notes for the same topic with slightly different filenames. Add a deduplication pass that compares filenames before writing.

---

## Performance

- [ ] **Lazy vault loading** — `readAllNotes` loads all vault files into memory for RAG. This is fine up to a few hundred notes but will be slow on large vaults. Switch to streaming/chunked reads and index on a background thread.

- [ ] **Graph performance** — The force-graph simulation can become sluggish with hundreds of nodes. Add a node-count threshold that switches to a simplified rendering mode.

---

## Done

- [x] Chat interface with Claude API streaming
- [x] Configurable conversation and extraction models (Opus / Sonnet / Haiku)
- [x] Knowledge extraction with YAML frontmatter, wikilinks, and folder routing
- [x] Append mode for existing notes
- [x] Daily journal with timestamped entries
- [x] Force-graph visualization of wikilink connections
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
