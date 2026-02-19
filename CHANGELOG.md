# Changelog

All notable changes to Mycelia are documented here.

## [Unreleased] — in progress

### Next up
- Vector search / embeddings for RAG (replace context stuffing)
- Multi-conversation support
- Ollama / local model integration
- Settings validation (API key format check + live test)

---

## [0.2.0] - 2026-02-19

Major feature expansion: note browser, daily notes view, WYSIWYG editing, BM25 full-text search, and a full graph rewrite with Cytoscape.

### Added

- **Note browser** (`/notes`) — folder explorer listing all vault files grouped by directory; click any note to open it
- **Note viewer/editor** (`/note/[...path]`) — opens a vault note with an editable title, WYSIWYG markdown editing via Tiptap, and a backlinks panel showing which notes link to the current one
- **Daily notes view** (`/daily`) — infinite-scroll calendar of journal entries; click any day to read or edit that day's journal file
- **NoteViewer component** — renders markdown to HTML via `marked`, detects `[[wikilinks]]` and converts them to in-app navigation links
- **MarkdownEditor component** — Tiptap-based WYSIWYG editor with markdown support via `tiptap-markdown`; writes back to the vault file on save
- **BackLinks component** — displays the list of vault notes that contain a `[[wikilink]]` pointing to the current note
- **Calendar component** — month grid used in the daily notes view; highlights days that have journal entries
- **BM25 full-text search** (`src/lib/search/indexer.ts`) — in-memory BM25 index built from all vault notes on load; returns ranked results by keyword relevance; used in the notes browser
- **Notes store** (`src/lib/stores/notes.ts`) — reactive Svelte store managing note loading, BM25 index state, and backlink computation
- **Graph rewrite** — replaced `force-graph` (canvas) with Cytoscape.js + `cytoscape-fcose` layout; nodes are styled by folder, phantom nodes shown for unresolved wikilinks, clicking a node navigates to that note
- **Type declaration** for `cytoscape-fcose` layout extension (`src/types/cytoscape-fcose.d.ts`)
- `marked` dependency for markdown-to-HTML rendering in NoteViewer
- Tiptap dependencies (`@tiptap/core`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/pm`, `tiptap-markdown`) for WYSIWYG editing
- `cytoscape` and `cytoscape-fcose` dependencies for the new graph implementation

### Changed

- **Sidebar** — expanded navigation to include Notes and Daily sections alongside Chat, Graph, and Settings
- **GraphView.svelte** — rewritten from ~53 lines (force-graph) to Cytoscape-based implementation with richer interaction and styling
- **Settings page** — additional options exposed
- **`claude.ts`**, **`extraction.ts`**, **`rag.ts`**, **`filesystem.ts`**, **`journal.ts`** — significant refactors improving robustness and expanding capability
- **`app.css`** — expanded global styles to support new views

### Removed

- `force-graph` dependency (replaced by Cytoscape)

---

## [0.1.0] - 2026-02-19

Initial MVP — conversation-first knowledge base.

### Added

- **Chat interface** with streaming Claude API responses
- **Knowledge extraction** — automatic background extraction of notes from conversations into structured markdown with YAML frontmatter and `[[wikilinks]]`
- **Daily journal** — auto-writes summarized entries to `journals/YYYY-MM-DD.md` with timestamps
- **Graph view** — force-directed visualization of notes and their wikilink connections, color-coded by folder
- **RAG retrieval** — detects retrieval queries and injects vault context into the conversation
- **Vault structure** — auto-creates `journals/`, `topics/`, `people/`, `projects/`, `decisions/`, `ideas/` folders
- **Onboarding** — first-run wizard for API key and vault directory selection
- **Chat persistence** — conversation history saved to `.mycelia/chat.json`
- **Settings page** with:
  - Conversation model selector (Opus 4.6, Sonnet 4.6, Haiku 4.5)
  - Extraction model selector (separate from conversation model)
  - Writing perspective toggle (first person vs second person)
  - Vault directory picker
  - API key management
- **Obsidian compatibility** — all output is standard markdown with wikilinks, works as an Obsidian vault
- **Dark theme** UI with Tailwind CSS
