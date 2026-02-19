# mycelia

**A conversation-first personal knowledge base.**

Chat with an AI. A second AI automatically extracts what you said, organizes it, and writes it into an Obsidian-compatible markdown vault — with wikilinks, frontmatter, and folder structure intact.

> **Prototype release.** This is an early version shared with the community. A polished desktop app with cloud sync is in development at [mycelia.garden](https://mycelia.garden).

---

## What it does

Most knowledge tools make organization the work. Mycelia inverts this. You have a conversation with an AI, and a second AI reads that conversation in the background — extracting notes, journal entries, and connections into a local markdown vault you own entirely.

The interface is a chat window. The output is a structured knowledge base that grows every time you talk.

- **Automatic extraction** — Facts, ideas, decisions, and people are extracted after every message exchange and written to the correct folder (`topics/`, `people/`, `projects/`, `decisions/`, `ideas/`). Existing notes are appended to rather than overwritten.
- **Daily journal** — Every session is summarized and appended to `journals/YYYY-MM-DD.md` with a timestamp.
- **Knowledge graph** — Live force-directed visualization of your vault's wikilink connections. Nodes are color-coded by folder. Phantom nodes appear for links not yet resolved.
- **Note browser + editor** — Browse your vault by folder, search by content (BM25 full-text), and edit notes with a WYSIWYG markdown editor (Tiptap).
- **Backlinks** — Every note shows all other notes that link to it.
- **RAG retrieval** — Ask "what did I decide about X?" or "remind me of my notes on Y" and Mycelia loads your vault as context.
- **Obsidian-compatible** — All output is plain markdown with YAML frontmatter and `[[wikilinks]]`. Your vault works in Obsidian, iA Writer, or any markdown tool — with or without Mycelia.
- **Local-first** — Your vault is a folder on your machine. No account required. Nothing leaves your device except direct API calls to Anthropic.

---

## Screenshots

![Mycelia screenshot 1](screenshots/Screenshot%202026-02-19%20at%2009.35.31.png)

![Mycelia screenshot 2](screenshots/Screenshot%202026-02-19%20at%2010.49.37.png)

![Mycelia screenshot 3](screenshots/Screenshot%202026-02-19%20at%2010.49.51.png)

![Mycelia screenshot 4](screenshots/Screenshot%202026-02-19%20at%2010.50.02.png)

![Mycelia screenshot 5](screenshots/Screenshot%202026-02-19%20at%2010.50.22.png)

![Mycelia screenshot 6](screenshots/Screenshot%202026-02-19%20at%2010.50.31.png)

---

## Stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri v2 (Rust) |
| Frontend | SvelteKit + Svelte 5 + TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Anthropic Claude API (BYOK) |
| Graph | Cytoscape.js + fcose layout |
| Editor | Tiptap v3 |
| Search | BM25 in-memory full-text index |
| Persistence | tauri-plugin-store + tauri-plugin-fs |

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh) — package manager
- [Rust](https://rustup.rs) — required by Tauri
- An [Anthropic API key](https://console.anthropic.com)

### Run in development

```bash
git clone https://github.com/your-username/mycelia
cd mycelia
bun install
bun tauri dev
```

On first launch, the onboarding wizard asks for your Anthropic API key and a vault directory. Both are stored locally.

### Build

```bash
bun tauri build
```

---

## Architecture

### Data flow

1. User sends a message in chat.
2. If the message matches a retrieval pattern, the full vault is read and injected into the system prompt.
3. A streaming request goes directly to the Anthropic API.
4. Once the response completes, two background tasks run in parallel:
   - `writeJournalEntry` — summarizes the exchange and appends to today's journal.
   - `extractKnowledge` — extracts structured notes and writes them to the vault.
5. All output is plain markdown in the user-selected directory.

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

### Source layout

```
src/lib/ai/         — Claude client, extraction engine, RAG
src/lib/vault/      — Filesystem ops, graph builder, journal writer, markdown parser
src/lib/stores/     — Svelte stores (chat, settings, notes)
src/lib/search/     — BM25 full-text search index
src/lib/components/ — UI components
src/routes/         — SvelteKit pages (chat, graph, notes, daily, settings)
src-tauri/src/      — Rust: Tauri plugin registration only
```

---

## Configuration

All settings are stored locally and never leave the machine (except the API key, which goes only to Anthropic).

| Setting | Default | Description |
|---|---|---|
| API Key | — | Anthropic API key |
| Vault Path | — | Directory where markdown files are written |
| Conversation Model | claude-sonnet-4-6 | Model used for chat responses |
| Extraction Model | claude-haiku-4-5-20251001 | Model used for background extraction and journaling |
| Writing Perspective | Second person | Whether notes say "You decided…" or "I decided…" |

---

## Prototype status

This is a working prototype. Core features function but expect rough edges:

- Full-text search is implemented but not yet wired to the search UI
- No multi-conversation support (single thread only)
- No local model / Ollama support yet
- No auto-update

The commercial version under development adds a polished UX, Ollama integration, cloud sync, multi-device access, and an MCP server so Claude.ai Desktop can access your vault natively.

---

## License

[PolyForm Noncommercial 1.0.0](./LICENSE) — free to use, modify, and study for personal non-commercial purposes. See [LICENSE](./LICENSE) for full terms.

---

## Contributing

Issues and discussion are welcome. Pull requests may be accepted for bug fixes.

For commercial licensing or to follow the product roadmap, visit [mycelia.garden](https://mycelia.garden).
