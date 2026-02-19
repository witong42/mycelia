# Mycelia — Lessons Learned

## 2026-02-19 — Initial documentation pass

### Extraction pipeline

- Claude's output format for note extraction is prompt-sensitive. The `===` separator and `---` frontmatter block must be in the system prompt with clear examples or the model drifts from the format, causing the parser to silently drop notes.
- `mode: append` works reliably when the full list of existing vault filenames is provided in the extraction prompt. Without that list, the model defaults to `create` and produces duplicate files.
- `NO_EXTRACTION` and `NO_ENTRY` sentinel responses are more reliable than instructing the model to output an empty response or `null`. Sentinel strings are easy to check and less likely to be confused with partial output.

### RAG

- Direct context stuffing (loading all notes into the system prompt) is viable for vaults up to a few hundred notes given Claude's large context window. The 400,000-character cap in `rag.ts` corresponds to roughly 100K tokens, which is well within the supported range.
- Regex-based retrieval detection has meaningful false negatives — users asking conversational questions that happen to touch on stored knowledge will not get vault context. BM25 full-text search wired into the RAG pipeline will improve coverage without the complexity of vector embeddings.

### Tauri + SvelteKit

- The `anthropic-dangerous-direct-browser-access: true` header is required to make fetch calls from the SvelteKit WebView directly to the Anthropic API. This is intentional in the Tauri context where there is no server-side proxy.
- `@tauri-apps/plugin-fs` operations are async and must be awaited. Forgetting this produces silent failures with no TypeScript error because the return type of `writeTextFile` is `Promise<void>`.
- Settings persistence via `tauri-plugin-store` requires the store to be initialized with `load()` before any `get()` calls. The `initSettings()` function in `stores/settings.ts` handles this; it must be called at app startup before anything reads from the settings store.

### Svelte 5

- Svelte 5 runes (`$state`, `$props`, `$derived`) are used throughout. Mixing Svelte 4 reactive declarations (`$:`) in the same codebase causes confusing compilation errors — keep everything on runes.
- `onMount` + `await` works reliably for Tauri plugin calls inside Svelte components. Avoid calling Tauri APIs at module initialization time (outside of `onMount`) since the Tauri bridge is not available until the WebView is fully initialized.

### Graph

- The `force-graph` library is not typed. We replaced it with Cytoscape.js + cytoscape-fcose, which has real TypeScript types and richer interaction support (click handlers, styled nodes, programmatic layout control).
- The `cytoscape-fcose` layout extension must be registered via `cytoscape.use(fcose)` before any graph instance is created. It has no published TypeScript types — a manual declaration file (`src/types/cytoscape-fcose.d.ts`) is required.
- Phantom nodes (for `[[wikilinks]]` that do not resolve to a file) are useful for showing the full conceptual map but can clutter the graph if a note contains many speculative or aspirational links. Consider a toggle to hide phantom nodes.

---

## 2026-02-19 — Note viewer, daily notes, and BM25 search

### Tiptap WYSIWYG

- Tiptap v3 with `tiptap-markdown` handles round-trip markdown serialization well (markdown → ProseMirror → markdown on save). Be careful when upgrading Tiptap: the `tiptap-markdown` extension tends to lag a major version behind and will break on a mismatch.
- Tiptap must be initialized inside `onMount` in a Svelte component. Constructing the `Editor` instance at module scope fails because the DOM node it binds to does not exist yet.
- Destroying the Tiptap editor in Svelte's `onDestroy` (or the `$effect` cleanup) is required to avoid memory leaks and duplicate editor instances on route navigation.

### BM25 search

- Implementing BM25 from scratch in TypeScript is straightforward and avoids a dependency on a search library. The algorithm needs only two tuning parameters (`k1`, `b`) and an inverted index. For vaults up to a few thousand notes the in-memory approach is fast enough for instant query results.
- Building the BM25 index separately from the notes store (as a standalone class in `indexer.ts`) keeps the search logic pure and testable without Svelte store dependencies. The store is responsible only for feeding content into the index and exposing search results reactively.
- Path terms should be given extra weight (doubled in the term list before indexing) so that searching by note title/filename ranks those notes highly even when the query term appears rarely in the body.
- The index must be rebuilt when the vault changes. Until an incremental update strategy is implemented, rebuild the entire index on every app load.

### Backlinks

- Computing backlinks requires reading the entire vault and scanning every note for wikilinks that resolve to the current note. This is an O(n) scan per note view. Cache results in the store if the vault is large.
- Wikilink matching should be case-insensitive and should check both the note's filename stem and its YAML `title` field. Users are inconsistent about casing and title formatting.

### Routing (SvelteKit + Tauri)

- SvelteKit's `[...path]` catch-all route works correctly in the static adapter used for Tauri. Use it for note paths that include subdirectories (e.g., `/note/topics/my-note.md`).
- The static adapter pre-renders all routes at build time. Any route that depends on dynamic data (like a vault note) must fetch that data in `onMount`, not in `load()`, because there is no server in the Tauri context.
