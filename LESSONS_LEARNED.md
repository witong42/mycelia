# Mycelia — Lessons Learned

## 2026-02-19 — Initial documentation pass

### Extraction pipeline

- Claude's output format for note extraction is prompt-sensitive. The `===` separator and `---` frontmatter block must be in the system prompt with clear examples or the model drifts from the format, causing the parser to silently drop notes.
- `mode: append` works reliably when the full list of existing vault filenames is provided in the extraction prompt. Without that list, the model defaults to `create` and produces duplicate files.
- `NO_EXTRACTION` and `NO_ENTRY` sentinel responses are more reliable than instructing the model to output an empty response or `null`. Sentinel strings are easy to check and less likely to be confused with partial output.

### RAG

- Direct context stuffing (loading all notes into the system prompt) is viable for vaults up to a few hundred notes given Claude's large context window. The 400,000-character cap in `rag.ts` corresponds to roughly 100K tokens, which is well within the supported range.
- Regex-based retrieval detection has meaningful false negatives — users asking conversational questions that happen to touch on stored knowledge will not get vault context. Vector search will fix this but adds significant implementation complexity.

### Tauri + SvelteKit

- The `anthropic-dangerous-direct-browser-access: true` header is required to make fetch calls from the SvelteKit WebView directly to the Anthropic API. This is intentional in the Tauri context where there is no server-side proxy.
- `@tauri-apps/plugin-fs` operations are async and must be awaited. Forgetting this produces silent failures with no TypeScript error because the return type of `writeTextFile` is `Promise<void>`.
- Settings persistence via `tauri-plugin-store` requires the store to be initialized with `load()` before any `get()` calls. The `initSettings()` function in `stores/settings.ts` handles this; it must be called at app startup before anything reads from the settings store.

### Svelte 5

- Svelte 5 runes (`$state`, `$props`, `$derived`) are used throughout. Mixing Svelte 4 reactive declarations (`$:`) in the same codebase causes confusing compilation errors — keep everything on runes.
- `onMount` + `await` works reliably for Tauri plugin calls inside Svelte components. Avoid calling Tauri APIs at module initialization time (outside of `onMount`) since the Tauri bridge is not available until the WebView is fully initialized.

### Graph

- The `force-graph` library is not typed. The approach of casting node/link callbacks to `object` and then to the typed interface (`node as GraphNode`) is verbose but works without `any` in most places. `GraphView.svelte` still uses `any` for the graph instance itself because the library's constructor return type is not exported.
- Phantom nodes (for `[[wikilinks]]` that do not resolve to a file) are useful for showing the full conceptual map but can clutter the graph if a note contains many speculative or aspirational links. Consider a toggle to hide phantom nodes.
