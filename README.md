# Mycelia

A conversation-first personal knowledge base. You talk — Mycelia organizes everything into structured markdown automatically.

**mycelia.garden**

---

## What it is

Most knowledge tools make organization the work. Mycelia inverts this. You have a conversation with an AI, and behind the scenes a second AI reads that conversation and extracts notes, journal entries, and connections into a local markdown vault — Obsidian-compatible, owned entirely by you.

The interface is a chat window. The output is a structured knowledge base that grows every time you talk.

## Features

- **Streaming chat** — Conversational interface powered by Claude (Opus, Sonnet, or Haiku — your choice). Responses stream in real time.
- **Automatic knowledge extraction** — After each message exchange, a background AI call reads the conversation and extracts structured notes with YAML frontmatter and `[[wikilinks]]`. Notes are routed to the correct folder automatically (`topics/`, `people/`, `projects/`, `decisions/`, `ideas/`). Existing notes are appended to rather than overwritten.
- **Daily journal** — Every exchange that contains something worth remembering is summarized and appended to `journals/YYYY-MM-DD.md` with a timestamp.
- **Graph view** — Force-directed visualization of your vault's wikilink connections. Nodes are color-coded by folder. Phantom nodes appear for links that don't yet resolve to a file.
- **RAG retrieval** — Pattern-matching detects retrieval questions ("what did I decide about...", "remind me of...", "find my notes on...") and loads vault context into the prompt so Claude can answer from your own knowledge base.
- **Settings** — Configure API key, vault directory, conversation model, extraction model, and writing perspective (first or second person).
- **Onboarding** — First-run wizard collects API key and vault directory before showing the main UI.
- **Chat persistence** — Conversation history is saved to `.mycelia/chat.json` inside the vault directory and restored on launch.
- **Obsidian compatibility** — All output is standard markdown. The vault folder layout, YAML frontmatter, and wikilink syntax are fully compatible with Obsidian.

## Tech stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri v2 (Rust) |
| Frontend framework | SvelteKit + Svelte 5 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Anthropic Claude API (direct browser access) |
| Graph | force-graph |
| Settings persistence | tauri-plugin-store |
| Filesystem | tauri-plugin-fs |
| Directory picker | tauri-plugin-dialog |

## Getting started

You need an [Anthropic API key](https://console.anthropic.com/).

```sh
# Install dependencies
bun install

# Start the desktop app (development)
bun run tauri dev
```

On first launch, Mycelia will walk you through entering your API key and selecting a vault directory. After that, just start talking.

### Build for distribution

```sh
bun run tauri build
```

## Architecture

```
src/
  lib/
    ai/
      claude.ts       — Claude API client: streaming chat + non-streaming extraction calls
      extraction.ts   — Knowledge extraction engine: parses AI output into vault notes
      rag.ts          — RAG retrieval: detects queries, stuffs vault context into prompt
    vault/
      filesystem.ts   — Tauri FS wrappers: read/write notes, list vault, persist chat history
      graph.ts        — Graph builder: transforms vault files into nodes and links
      journal.ts      — Daily journal writer: summarizes exchanges to journals/YYYY-MM-DD.md
      parser.ts       — Markdown utilities: wikilink extraction, frontmatter parsing, slugify
    stores/
      chat.ts         — Message store: manages conversation state and persistence
      settings.ts     — Settings store: persists config via tauri-plugin-store
    components/
      ChatInput.svelte    — Message input bar
      ChatMessage.svelte  — Individual message bubble
      GraphView.svelte    — force-graph canvas component
      Onboarding.svelte   — First-run setup wizard
      Sidebar.svelte      — Navigation (Chat / Graph / Settings)
  routes/
    +layout.svelte    — App shell: initializes settings, vault, and chat history on mount
    +page.svelte      — Chat view: the main conversation screen
    graph/
      +page.svelte    — Graph view: loads vault and renders knowledge graph
    settings/
      +page.svelte    — Settings view: API key, model, vault, writing style

src-tauri/
  src/
    lib.rs            — Tauri app builder: registers FS, dialog, store, and log plugins
    main.rs           — Entry point
  Cargo.toml          — Rust dependencies
  capabilities/
    default.json      — Tauri v2 capability grants (filesystem, dialog, store)
```

### Data flow

1. User sends a message in the chat view.
2. If the message matches a retrieval pattern, the full vault is read and injected into the system prompt.
3. A streaming request goes directly to the Anthropic API.
4. Once the response completes, two background tasks run in parallel:
   - `writeJournalEntry` — summarizes the exchange and appends to today's journal.
   - `extractKnowledge` — extracts structured notes and writes them to the vault.
5. All vault output is plain markdown files in the user-selected directory.

### Vault structure

```
<vault>/
  journals/         — Daily entries (YYYY-MM-DD.md)
  topics/           — General knowledge and concepts
  people/           — People mentioned in conversation
  projects/         — Active projects and ventures
  decisions/        — Decisions with reasoning
  ideas/            — Raw ideas and creative sparks
  .mycelia/
    chat.json       — Persisted conversation history
```

## Configuration

All settings are stored locally via `tauri-plugin-store` and never leave the machine (except the API key, which goes only to Anthropic's API endpoint).

| Setting | Default | Description |
|---|---|---|
| API Key | — | Anthropic API key |
| Vault Path | — | Directory where markdown files are written |
| Conversation Model | claude-sonnet-4-6 | Model used for chat |
| Extraction Model | claude-haiku-4-5-20251001 | Model used for extraction and journals |
| Writing Perspective | Second person | Whether notes say "You decided..." or "I decided..." |
